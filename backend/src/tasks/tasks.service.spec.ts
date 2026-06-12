import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;

  const mockPrisma = {
    task: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockNotifications = {
    notifyTaskCreated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new TasksService(
      mockPrisma as any,
      mockNotifications as any,
    );
  });

  it('should create task when description is missing', async () => {
    const task = {
      id: '1',
      title: 'Test Task',
      description: undefined,
      preview: '',
      priority: 2,
    };

    mockPrisma.task.create.mockResolvedValue(task);
    mockNotifications.notifyTaskCreated.mockResolvedValue(undefined);

    const result = await service.createTask({
      title: 'Test Task',
    } as any);

    expect(result).toEqual(task);
  });

  it('should mark task as completed', async () => {
    mockPrisma.task.findUnique.mockResolvedValue({
      id: '1',
      completed: false,
    });

    mockPrisma.task.update.mockResolvedValue({
      id: '1',
      completed: true,
    });

    const result = await service.completeTask('1');

    expect(result.completed).toBe(true);
  });

  it('should throw NotFoundException when task does not exist', async () => {
    mockPrisma.task.findUnique.mockResolvedValue(null);

    await expect(service.completeTask('999'))
      .rejects
      .toThrow(NotFoundException);
  });
});