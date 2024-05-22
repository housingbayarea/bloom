import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ScriptRunnerService } from '../../../src/services/script-runner.service';
import { PrismaService } from '../../../src/services/prisma.service';
import { User } from '../../../src/dtos/users/user.dto';

describe('Testing script runner service', () => {
  let service: ScriptRunnerService;
  let prisma: PrismaService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScriptRunnerService,
        PrismaService,
        Logger,
        SchedulerRegistry,
      ],
    }).compile();

    service = module.get<ScriptRunnerService>(ScriptRunnerService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  // | ---------- HELPER TESTS BELOW ---------- | //
  it('should mark script run as started if no script run present in db', async () => {
    prisma.scriptRuns.findUnique = jest.fn().mockResolvedValue(null);
    prisma.scriptRuns.create = jest.fn().mockResolvedValue(null);

    const id = randomUUID();
    const scriptName = 'new run attempt';

    await service.markScriptAsRunStart(scriptName, {
      id,
    } as unknown as User);

    expect(prisma.scriptRuns.findUnique).toHaveBeenCalledWith({
      where: {
        scriptName,
      },
    });
    expect(prisma.scriptRuns.create).toHaveBeenCalledWith({
      data: {
        scriptName,
        triggeringUser: id,
      },
    });
  });

  it('should error if script run is in progress or failed', async () => {
    prisma.scriptRuns.findUnique = jest.fn().mockResolvedValue({
      id: randomUUID(),
      didScriptRun: false,
    });
    prisma.scriptRuns.create = jest.fn().mockResolvedValue(null);

    const id = randomUUID();
    const scriptName = 'new run attempt 2';

    await expect(
      async () =>
        await service.markScriptAsRunStart(scriptName, {
          id,
        } as unknown as User),
    ).rejects.toThrowError(
      `${scriptName} has an attempted run and it failed, or is in progress. If it failed, please delete the db entry and try again`,
    );

    expect(prisma.scriptRuns.findUnique).toHaveBeenCalledWith({
      where: {
        scriptName,
      },
    });
    expect(prisma.scriptRuns.create).not.toHaveBeenCalled();
  });

  it('should error if script run already succeeded', async () => {
    prisma.scriptRuns.findUnique = jest.fn().mockResolvedValue({
      id: randomUUID(),
      didScriptRun: true,
    });
    prisma.scriptRuns.create = jest.fn().mockResolvedValue(null);

    const id = randomUUID();
    const scriptName = 'new run attempt 3';

    await expect(
      async () =>
        await service.markScriptAsRunStart(scriptName, {
          id,
        } as unknown as User),
    ).rejects.toThrowError(`${scriptName} has already been run and succeeded`);

    expect(prisma.scriptRuns.findUnique).toHaveBeenCalledWith({
      where: {
        scriptName,
      },
    });
    expect(prisma.scriptRuns.create).not.toHaveBeenCalled();
  });

  it('should mark script run as started if no script run present in db', async () => {
    prisma.scriptRuns.update = jest.fn().mockResolvedValue(null);

    const id = randomUUID();
    const scriptName = 'new run attempt 4';

    await service.markScriptAsComplete(scriptName, {
      id,
    } as unknown as User);

    expect(prisma.scriptRuns.update).toHaveBeenCalledWith({
      data: {
        didScriptRun: true,
        triggeringUser: id,
      },
      where: {
        scriptName,
      },
    });
  });
});
