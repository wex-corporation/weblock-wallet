import { HttpClient } from '../http'
import { CreateOrganizationRequest } from '../types'

export class OrganizationClient {
  private readonly baseUrl = '/v1/organizations'

  constructor(private readonly client: HttpClient) {}

  async createOrganization(request: CreateOrganizationRequest): Promise<void> {
    await this.client.post(this.baseUrl, request)
  }
}
