import { Client } from '../../utils/httpClient'

interface CreateOrganizationRequest {
  name: string
  apiKey: string
}

export class OrganizationClient {
  private readonly baseUrl = '/v1/organizations'
  public readonly client: Client

  constructor(client: Client) {
    this.client = client
  }

  async createOrganization(request: CreateOrganizationRequest): Promise<void> {
    await this.client.post(`${this.baseUrl}`, request)
  }
}
