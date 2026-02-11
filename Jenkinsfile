pipeline {
  agent any

  parameters {
    string(name: 'BRANCH_NAME', defaultValue: 'main', description: 'Git branch to build')
    string(name: 'REPO_URL', defaultValue: 'https://your-repo-url.git', description: 'Git repository URL')
  }

  stages {
    stage('Checkout') {
      steps {
        git branch: params.BRANCH_NAME, url: params.REPO_URL
      }
    }

    stage('Install') {
      steps {
        sh 'npm install'
        sh 'npx playwright install --with-deps'
      }
    }

    stage('Test') {
      steps {
        sh 'npx playwright test'
      }
    }

    stage('Publish Report') {
      steps {
        publishHTML(target: [
          reportDir: 'reports/playwright-html',
          reportFiles: 'index.html',
          reportName: 'Playwright HTML Report',
          keepAll: true,
          alwaysLinkToLastBuild: true
        ])
      }
    }
  }

  post {
    always {
      junit 'reports/junit/results.xml'
      archiveArtifacts artifacts: 'reports/playwright-html/**', fingerprint: true
    }
  }
}
