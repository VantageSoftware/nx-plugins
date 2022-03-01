import { execSyncMock } from '../../utils/mocks/child_process.mock';

const buildExecutorMock = jest.fn();

jest.mock('../build/executor', () => {
  return buildExecutorMock;
});

import { ToxExecutorSchema } from './schema';
import executor from './executor';
import fsMock from 'mock-fs';
import chalk from 'chalk';

const options: ToxExecutorSchema = {
  silent: false,
};

describe('Tox Executor', () => {
  const context = {
    cwd: '',
    root: '',
    isVerbose: false,
    projectName: 'app',
    workspace: {
      version: 2,
      npmScope: '@lucasvieira',
      projects: {
        app: {
          root: 'apps/app',
          targets: {},
        },
      },
    },
  };

  beforeAll(() => {
    console.log(chalk`init chalk`);
  });

  afterEach(() => {
    fsMock.restore();
    jest.resetAllMocks();
  });

  it('should build and run tox successfully', async () => {
    buildExecutorMock.mockResolvedValue({
      success: true
    })

    fsMock({
      'apps/app/dist/package.tar.gz': 'fake',
    })

    const output = await executor(options, context);

    expect(buildExecutorMock).toBeCalledWith(
      {
        silent: options.silent,
        keepBuildFolder: false,
        ignorePaths: ['.venv', '.tox', 'tests'],
        outputPath: 'apps/app/dist',
      },
      context
    );
    expect(execSyncMock).toBeCalledWith(
      'poetry run tox --installpkg dist/package.tar.gz ', {
      cwd: 'apps/app',
      stdio: 'inherit',
    });
    expect(output.success).toBe(true);
  });

  it('should build and run tox successfully with args', async () => {
    buildExecutorMock.mockResolvedValue({
      success: true
    })

    fsMock({
      'apps/app/dist/package.tar.gz': 'fake',
    })

    const output = await executor({
      silent: false,
      args: '-e linters'
    }, context);

    expect(buildExecutorMock).toBeCalledWith(
      {
        silent: options.silent,
        keepBuildFolder: false,
        ignorePaths: ['.venv', '.tox', 'tests'],
        outputPath: 'apps/app/dist',
      },
      context
    );
    expect(execSyncMock).toBeCalledWith(
      'poetry run tox --installpkg dist/package.tar.gz -e linters', {
      cwd: 'apps/app',
      stdio: 'inherit',
    });
    expect(output.success).toBe(true);
  });

  it('should failure the build and not run tox command', async () => {
    buildExecutorMock.mockResolvedValue({
      success: false
    })

    const output = await executor(options, context);

    expect(buildExecutorMock).toBeCalledWith(
      {
        silent: options.silent,
        keepBuildFolder: false,
        ignorePaths: ['.venv', '.tox', 'tests'],
        outputPath: 'apps/app/dist',
      },
      context
    );
    expect(execSyncMock).not.toBeCalled();
    expect(output.success).toBe(false);
  });

  it('should dist folder not exists and not run tox command', async () => {
    buildExecutorMock.mockResolvedValue({
      success: true
    })

    const output = await executor(options, context);

    expect(buildExecutorMock).toBeCalledWith(
      {
        silent: options.silent,
        keepBuildFolder: false,
        ignorePaths: ['.venv', '.tox', 'tests'],
        outputPath: 'apps/app/dist',
      },
      context
    );
    expect(execSyncMock).not.toBeCalled();
    expect(output.success).toBe(false);
  });

  it('should not generate the tar.gz and not run tox command', async () => {

    fsMock({
      'apps/app/dist/something.txt': 'fake',
    })

    buildExecutorMock.mockResolvedValue({
      success: true
    })

    const output = await executor(options, context);

    expect(buildExecutorMock).toBeCalledWith(
      {
        silent: options.silent,
        keepBuildFolder: false,
        ignorePaths: ['.venv', '.tox', 'tests'],
        outputPath: 'apps/app/dist',
      },
      context
    );
    expect(execSyncMock).not.toBeCalled();
    expect(output.success).toBe(false);
  });
});
