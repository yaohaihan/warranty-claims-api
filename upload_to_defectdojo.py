import requests
import sys

file_name = sys.argv[1]
scan_type = ''
test_id = 0
if file_name == 'gitleaks-report.json':
    scan_type = 'Gitleaks Scan'
    test_id = 41
elif file_name == 'njsscan.sarif':
    scan_type = 'SARIF'
    test_id = 52
elif file_name == 'retire.json':
    scan_type = 'Retire.js Scan'
    test_id = 53
elif file_name == 'trivy-report.json':
    test_id = 54
    scan_type = 'Trivy Scan'
    

headers = {
    'Authorization': 'Token 548afd6fab3bea9794a41b31da0e9404f733e222'
}

url = 'https://demo.defectdojo.org/api/v2/reimport-scan/'

data = {
    'active': True,
    'verified': True,
    'scan_type': scan_type,
    'minimum_severity': 'Low',
    'engagement': 16,
    'environment': 'Test',
    'test': test_id
}

files = {
    'file': open(file_name,'rb')
}

response = requests.post(url,headers = headers,data=data, files=files)

if response.status_code == 201:
    print('Scan results imported successfully')
else:
    print(f'Failed to import scan results: {response.content}')
