import { HttpClient } from './http';
import { HttpError, NetworkError } from '../errors/http';

describe('HttpClient', () => {
  let client: HttpClient;

  beforeEach(() => {
    client = new HttpClient({
      baseURL: 'http://localhost:8080',
      headers: {
        'x-api-key': 'test-api-key',
      },
    });
  });

  it('should create instance with correct config', () => {
    expect(client).toBeInstanceOf(HttpClient);
  });

  // 추가 테스트 케이스는 필요할 때 작성
});
