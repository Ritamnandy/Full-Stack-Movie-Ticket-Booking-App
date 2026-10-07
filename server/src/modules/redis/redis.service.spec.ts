import { RedisService } from './redis.service.js';

describe('RedisService', () => {
  let service: RedisService;
  const client = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    quit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = Object.create(RedisService.prototype) as RedisService;
    (service as unknown as { redis: typeof client }).redis = client;
  });

  it('delegates cache operations to the Redis client', async () => {
    client.get.mockResolvedValue('cached-value');
    client.set.mockResolvedValue('OK');
    client.del.mockResolvedValue(1);

    await expect(service.getData('profile:1')).resolves.toBe('cached-value');
    await expect(service.setData('profile:1', 'cached-value', 60)).resolves.toBe('OK');
    await expect(service.deleteData('profile:1')).resolves.toBe(1);

    expect(client.get).toHaveBeenCalledWith('profile:1');
    expect(client.set).toHaveBeenCalledWith('profile:1', 'cached-value', 'EX', 60);
    expect(client.del).toHaveBeenCalledWith('profile:1');
  });

  it('closes the Redis client during module destruction', async () => {
    await service.onModuleDestroy();

    expect(client.quit).toHaveBeenCalledOnce();
  });
});
