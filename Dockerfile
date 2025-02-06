FROM yaohaihan/juice-shop-base:latest

WORKDIR /app

#复制项目所有代码，除了 package.json 等依赖文件
COPY . .

RUN npm run build

#启动应用
CMD ["npm", "run", "start:prod"]
