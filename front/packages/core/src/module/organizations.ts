import { Client } from '../utils/httpClient'
// import { Firebase } from '../auth/firebase'
import { Blockchain, ApiKeyPair } from '@weblock-wallet/types'
import { OrganizationClient } from '../clients/organizations'
import { Crypto } from '../utils/crypto'

export class Organizations {
  private organizationClient: OrganizationClient
  private readonly orgHost: string
  public registeredBlockchains: Blockchain[] = []

  constructor(client: Client) {
    this.organizationClient = new OrganizationClient(client)
    this.orgHost = client.getOrgHost()
  }

  async createOrganization(name: string): Promise<ApiKeyPair> {
    try {
      const apiKeyPair = await Crypto.createEdDSAKeyPair()
      await this.organizationClient.createOrganization({
        name,
        apiKey: apiKeyPair.apiKey
      })
      return apiKeyPair
    } catch (error) {
      console.error('Error during createOrganization:', error)
      throw error
    }
  }

  async addAllowedHost(hostname: string): Promise<void> {
    try {
      await this.organizationClient.addAllowedHost({ hostname })
      console.log('Allowed host added:', hostname)
    } catch (error) {
      console.error('Error adding allowed host:', error)
      throw error
    }
  }
}
