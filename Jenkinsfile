pipeline {
    agent any

    environment {
        BASE_IMAGE_NAME = 'yaohaihan/store-base'
        APP_IMAGE_NAME = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/store"
        INSTANCE_ID = 'i-0d0fbbefa1e530d83'  
        APP_URL = 'http://18.141.188.146:3000'
    }

    stages {
        stage('Detect Changes') {
            steps {
                script {
                    def changes = sh(script: 'git diff --name-only HEAD~1 HEAD', returnStdout: true).trim()
                    env.BASE_IMAGE_CHANGED = (changes.contains('package.json') || changes.contains('Dockerfile.base') || changes.contains('package-lock.json')).toString()
                    echo "Base image change detected: ${env.BASE_IMAGE_CHANGED}"
                }
            }
        }

        stage('Security Scans') {
            parallel {
                stage('njsscan check') {
                    agent {
                        docker {
                            image 'python'
                            args '--entrypoint=""'
                        }
                    }

                    steps{
                        script {catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                            catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                                sh'''
                                pip install --upgrade pip
                                pip install njsscan
                                njsscan --exit-warning .  --sarif -o njsscan.sarif 
                                '''
                            }

                        }
                    }

                    post {
                        always {
                            archiveArtifacts artifacts: 'njsscan.sarif', allowEmptyArchive: true
                        }
                    }            
                }

                stage('Retire.js check') {
                    agent {
                        docker{
                            image 'node:19-bullseye'
                            args '--entrypoint=""'
                        }
                    }

                    steps {
                        script {
                            catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                                sh'''
                                npm install -g retire
                                retire --path . -- outputformat json -- outputpath retire.json
                                '''
                            }
                        }
                    }

                    post {
                        always {
                            archiveArtifacts artifacts: 'retire.json', allowEmptyArchive: true
                        }
                    }
                }
            }
        }

        stage('Upload reports to Defectdojo'){
            steps {
                script{
                    sh '''
                        python3 upload_to_defectdojo.py njsscan.sarif
                        python3 upload_to_defectdojo.py retire.json
                    '''
                }
            }
        }


        stage('Install Dependencies and Test') {
            agent {
                docker {
                    image 'node:20.11.1'
                    args '--rm'
                }   
            }

            steps {
                sh '''
                npm install
                npm run test
                '''
            }
        }

        stage('Build Project') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Build Base Image') {
            when {
                expression { env.BASE_IMAGE_CHANGED == 'true' }
            }
            steps {
                sh '''
                docker build -t $BASE_IMAGE_NAME:latest -f Dockerfile.base .
                '''
            }
        }  

        stage('Build and Push Application Image') {
            steps {
                script {
                    aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
                    docker build --cache-from=$BASE_IMAGE_NAME:latest -t $APP_IMAGE_NAME:$BUILD_NUMBER \
                                -t $APP_IMAGE_NAME:latest  .
                    docker push $APP_IMAGE_NAME:$BUILD_NUMBER
                    docker push $APP_IMAGE_NAME:latest
                }
            }
        }

		stage('Scan Image with Trivy') {
            steps{
                catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                    sh'''
                    docker run --rm \
                    -v /var/run/docker.sock:/var/run/docker.sock \
                    -v $HOME/.cache:/root/.cache \
                    -v $PWD:/reports \
                    aquasec/trivy:latest --severity HIGH,CRITICAL \
                    --format json \
                    --output /reports/trivy-report.json \
                    image $APP_IMAGE_NAME:$BUILD_NUMBER 
                    '''
                }
            }

            post{
                always {
                    archiveArtifacts artifacts: 'trivy-report.json', allowEmptyArchive: true
                }
            }
        }

        stage('Upload trivy reports to Defectdojo'){
            steps {
                script{
                    sh '''
                    python3 upload_to_defectdojo.py trivy-report.json
                    '''
                }
            }
        }


        stage('Deploy to Server') {
            agent {
                docker {
                    image 'amazon/aws-cli'
                    args '--entrypoint=""'
                }
            }

            steps {
                script {
                    echo "Starting SSM command execution..."

                    // 将AWS和Docker命令处理为单行字符串
                    def dockerCommands = """
                        export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID} && \
                        export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY} && \
                        export AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION} && \
                        aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com && \
                        docker pull ${APP_IMAGE_NAME}:latest && \
                        docker stop store || true && \
                        docker rm store || true && \
                        docker run -d --name store -p 3000:3000 ${APP_IMAGE_NAME}:latest
                    """.replaceAll('"', '\\"').replaceAll('\n', '')

                    //发送SSM命令
                    def commandId = sh(script: """
                        aws ssm send-command \
                        --instance-ids ${INSTANCE_ID} \
                        --document-name 'AWS-RunShellScript' \
                        --parameters '{"commands":["${dockerCommands}"]}' \
                        --query 'Command.CommandId' \
                        --output text
                    """, returnStdout: true).trim()

                    echo "Command ID: ${commandId}"
                    echo "${dockerCommands}"

                    //检查命令执行状态  wait关键字
                    sh """
                        aws ssm wait command-executed \
                        --command-id ${commandId} \
                        --instance-id ${INSTANCE_ID}
                    """
                    echo "${dockerCommands}"
                    sh """
                        aws ssm get-command-invocation \
                        --command-id ${commandId} \
                        --instance-id ${INSTANCE_ID} \
                        --output json
                    """
                }
            }
        }

        stage('Zap Scan') {
            agent {
                docker {
                    image 'ghcr.io/zaproxy/zaproxy:stable'
                    args '-u root:root'
                }
            }

            environment {
                ZAP_TARGET = "${APP_URL}"
            }

            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                    sh'''
                    mkdir -p /zap/wrk

                    zap-baseline.py -t $ZAP_TARGET -g gen.conf -I -x baseline.xml
                    cp /zap/wrk/baseline.xml baseline.xml
                    '''
                }
            }

            post{
                always {
                    archiveArtifacts artifacts: 'baseline.xml', allowEmptyArchive: true
                }
            }    
        }
    }

    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}
