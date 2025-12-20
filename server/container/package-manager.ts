import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { containerRuntime, type ExecutionRequest } from './runtime';

interface PackageInstallRequest {
  projectId: string;
  language: string;
  packages: string[];
  workingDir?: string;
}

interface PackageInstallResult {
  success: boolean;
  stdout: string;
  stderr: string;
  duration: number;
  installedPackages: string[];
}

class PackageManager {
  private readonly packageConfigs = {
    javascript: {
      file: 'package.json',
      installCommand: 'npm install',
      addCommand: 'npm install',
      removeCommand: 'npm uninstall',
      listCommand: 'npm list --json',
      initCommand: 'npm init -y'
    },
    typescript: {
      file: 'package.json',
      installCommand: 'npm install',
      addCommand: 'npm install',
      removeCommand: 'npm uninstall',
      listCommand: 'npm list --json',
      initCommand: 'npm init -y'
    },
    python: {
      file: 'requirements.txt',
      installCommand: 'pip install -r requirements.txt',
      addCommand: 'pip install',
      removeCommand: 'pip uninstall',
      listCommand: 'pip list --format=json',
      initCommand: 'echo "" > requirements.txt'
    },
    java: {
      file: 'pom.xml',
      installCommand: 'mvn install',
      addCommand: 'mvn dependency:get',
      removeCommand: 'mvn dependency:remove',
      listCommand: 'mvn dependency:list',
      initCommand: 'mvn archetype:generate -DgroupId=com.stargate.app -DartifactId=stargate-app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false'
    },
    go: {
      file: 'go.mod',
      installCommand: 'go mod download',
      addCommand: 'go get',
      removeCommand: 'go mod edit -droprequire',
      listCommand: 'go list -m all',
      initCommand: 'go mod init stargate-app'
    },
    rust: {
      file: 'Cargo.toml',
      installCommand: 'cargo build',
      addCommand: 'cargo add',
      removeCommand: 'cargo remove',
      listCommand: 'cargo tree',
      initCommand: 'cargo init'
    }
  };

  async installPackages(request: PackageInstallRequest): Promise<PackageInstallResult> {
    const startTime = Date.now();
    
    try {
      const config = this.packageConfigs[request.language as keyof typeof this.packageConfigs];
      if (!config) {
        throw new Error(`Package management not supported for language: ${request.language}`);
      }

      // Prepare installation command
      const packages = request.packages.join(' ');
      const command = `${config.addCommand} ${packages}`;

      // Execute package installation in container
      const executionRequest: ExecutionRequest = {
        id: `pkg-install-${Date.now()}`,
        projectId: request.projectId,
        language: request.language,
        code: '', // No code needed for package installation
        command: command,
        workingDir: request.workingDir || '/workspace'
      };

      const result = await containerRuntime.executeCode(executionRequest);
      
      return {
        success: result.exitCode === 0,
        stdout: result.stdout,
        stderr: result.stderr,
        duration: Date.now() - startTime,
        installedPackages: result.exitCode === 0 ? request.packages : []
      };

    } catch (error) {
      return {
        success: false,
        stdout: '',
        stderr: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
        installedPackages: []
      };
    }
  }

  async initializeProject(projectId: string, language: string): Promise<PackageInstallResult> {
    const startTime = Date.now();

    try {
      const config = this.packageConfigs[language as keyof typeof this.packageConfigs];
      if (!config) {
        throw new Error(`Project initialization not supported for language: ${language}`);
      }

      const executionRequest: ExecutionRequest = {
        id: `pkg-init-${Date.now()}`,
        projectId: projectId,
        language: language,
        code: '',
        command: config.initCommand,
        workingDir: '/workspace'
      };

      const result = await containerRuntime.executeCode(executionRequest);

      return {
        success: result.exitCode === 0,
        stdout: result.stdout,
        stderr: result.stderr,
        duration: Date.now() - startTime,
        installedPackages: []
      };

    } catch (error) {
      return {
        success: false,
        stdout: '',
        stderr: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
        installedPackages: []
      };
    }
  }

  async getInstalledPackages(projectId: string, language: string): Promise<string[]> {
    try {
      const config = this.packageConfigs[language as keyof typeof this.packageConfigs];
      if (!config) {
        return [];
      }

      const executionRequest: ExecutionRequest = {
        id: `pkg-list-${Date.now()}`,
        projectId: projectId,
        language: language,
        code: '',
        command: config.listCommand,
        workingDir: '/workspace'
      };

      const result = await containerRuntime.executeCode(executionRequest);
      
      if (result.exitCode !== 0) {
        return [];
      }

      // Parse package list based on language
      return this.parsePackageList(language, result.stdout);

    } catch (error) {
      console.error('Failed to get installed packages:', error);
      return [];
    }
  }

  private parsePackageList(language: string, output: string): string[] {
    try {
      switch (language) {
        case 'javascript':
        case 'typescript':
          // Parse npm list JSON output
          const npmData = JSON.parse(output);
          return Object.keys(npmData.dependencies || {});
          
        case 'python':
          // Parse pip list JSON output
          const pipData = JSON.parse(output);
          return pipData.map((pkg: any) => pkg.name);
          
        case 'go':
          // Parse go list -m all output
          return output.split('\n')
            .filter(line => line.trim() && !line.startsWith('go: '))
            .map(line => line.split(' ')[0]);
            
        case 'rust':
          // Parse cargo tree output
          return output.split('\n')
            .filter(line => line.includes('v'))
            .map(line => line.trim().split(' ')[0]);
            
        default:
          return [];
      }
    } catch (error) {
      console.error('Failed to parse package list:', error);
      return [];
    }
  }

  async removePackages(projectId: string, language: string, packages: string[]): Promise<PackageInstallResult> {
    const startTime = Date.now();

    try {
      const config = this.packageConfigs[language as keyof typeof this.packageConfigs];
      if (!config) {
        throw new Error(`Package removal not supported for language: ${language}`);
      }

      const packageList = packages.join(' ');
      const command = `${config.removeCommand} ${packageList}`;

      const executionRequest: ExecutionRequest = {
        id: `pkg-remove-${Date.now()}`,
        projectId: projectId,
        language: language,
        code: '',
        command: command,
        workingDir: '/workspace'
      };

      const result = await containerRuntime.executeCode(executionRequest);

      return {
        success: result.exitCode === 0,
        stdout: result.stdout,
        stderr: result.stderr,
        duration: Date.now() - startTime,
        installedPackages: []
      };

    } catch (error) {
      return {
        success: false,
        stdout: '',
        stderr: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
        installedPackages: []
      };
    }
  }

  getSupportedLanguages(): string[] {
    return Object.keys(this.packageConfigs);
  }

  getPackageFile(language: string): string | null {
    const config = this.packageConfigs[language as keyof typeof this.packageConfigs];
    return config ? config.file : null;
  }
}

export const packageManager = new PackageManager();
export type { PackageInstallRequest, PackageInstallResult };