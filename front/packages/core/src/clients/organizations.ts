import { Client } from '../utils/httpClient'
import {
  CreateOrganizationRequest,
  AddHostRequest
} from '@weblock-wallet/types'

export class OrganizationClient {
  private readonly baseUrl = '/v1/organizations'
  public readonly client: Client

  constructor(client: Client) {
    this.client = client
  }

  async createOrganization(request: CreateOrganizationRequest): Promise<void> {
    try {
      console.log('Sending request to create organization:', request)
      const response = await this.client.post(`${this.baseUrl}`, request)
      console.log('Organization created successfully:', response)
    } catch (error) {
      console.error(
        'Error while creating organization. Request:',
        request,
        'Error:',
        error
      )
      throw error
    }
  }

  async addAllowedHost(request: AddHostRequest): Promise<void> {
    await this.client.patch(`${this.baseUrl}/allowed-hosts`, request)
  }
}
