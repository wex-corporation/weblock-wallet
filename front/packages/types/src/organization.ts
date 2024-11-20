// organization.ts
export interface Organization {
  id: string
  name: string
  apiKey: string
  createdAt: Date
}

export interface CreateOrganizationRequest {
  name: string
  apiKey: string
}

export interface AddHostRequest {
  hostname: string
}
