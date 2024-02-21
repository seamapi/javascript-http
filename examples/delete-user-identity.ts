import type { Builder, Command, Describe } from 'landlubber'

import type {
  AcsCredentialsGetResponse,
  AcsUsersGetResponse,
  EventsListParams,
  EventsListResponse,
  PhonesListResponse,
  UserIdentitiesEnrollmentAutomationsGetResponse,
} from '@seamapi/http/connect'

import type { Handler } from './index.js'

interface Options {
  userIdentityId: string
}

export const command: Command = 'delete-user-identity userIdentityId'

export const describe: Describe = 'Delete a user identity'

export const builder: Builder = {
  userIdentityId: {
    type: 'string',
    describe: 'User identity id to delete',
  },
}

export const handler: Handler<Options> = async ({
  userIdentityId,
  seam,
  logger,
}) => {
  const waitForEvent = async (
    eventType: SeamEventType,
    eventFilter: (event: SeamEvent) => boolean,
  ): Promise<void> => {
    let events: SeamEvent[] = []
    do {
      events = await seam.events.list({ event_type: eventType })
    } while (!events.some(eventFilter))
  }

  const waitForAcsUserDeleted = async (acsUser: AcsUser): Promise<void> => {
    await waitForEvent(
      'acs_user.deleted',
      (event) =>
        'acs_user_id' in event && event.acs_user_id === acsUser.acs_user_id,
    )
  }

  const waitForAcsCredentialDeleted = async (
    acsCredential: AcsCredential,
  ): Promise<void> => {
    await waitForEvent(
      'acs_credential.deleted',
      (event) =>
        'acs_credential_id' in event &&
        event.acs_credential_id === acsCredential.acs_credential_id,
    )
  }

  const waitForPhoneDeactivated = async (phone: Phone): Promise<void> => {
    await waitForEvent(
      'phone.deactivated',
      (event) => 'device_id' in event && event.device_id === phone.device_id,
    )
  }

  const waitForEnrollmentAutomationDeleted = async (
    enrollmentAutomation: EnrollmentAutomation,
  ): Promise<void> => {
    await waitForEvent(
      'enrollment_automation.deleted',
      (event) =>
        'enrollment_automation_id' in event &&
        event.enrollment_automation_id ===
          enrollmentAutomation.enrollment_automation_id,
    )
  }

  const userIdentity = await seam.userIdentities.get({
    user_identity_id: userIdentityId,
  })

  const clientSessions = await seam.clientSessions.list({
    user_identity_ids: [userIdentityId],
  })

  for (const clientSession of clientSessions) {
    await seam.clientSessions.delete({
      client_session_id: clientSession.client_session_id,
    })
  }

  const enrollmentAutomations =
    await seam.userIdentities.enrollmentAutomations.list({
      user_identity_id: userIdentityId,
    })

  for (const enrollmentAutomation of enrollmentAutomations) {
    const credentials = await seam.acs.credentials.list({
      enrollment_automation_id: enrollmentAutomation.enrollment_automation_id,
      is_multi_phone_sync_credential: true,
    })

    for (const credential of credentials) {
      await seam.acs.credentials.delete({
        acs_credential_id: credential.acs_credential_id,
      })
    }

    await Promise.all(credentials.map(waitForAcsCredentialDeleted))

    await seam.userIdentities.enrollmentAutomations.delete({
      enrollment_automation_id: enrollmentAutomation.enrollment_automation_id,
    })
  }

  await Promise.all(
    enrollmentAutomations.map(waitForEnrollmentAutomationDeleted),
  )

  const phones = await seam.phones.list({
    owner_user_identity_id: userIdentityId,
  })

  for (const phone of phones) {
    await seam.phones.deactivate({
      device_id: phone.device_id,
    })
  }

  await Promise.all(phones.map(waitForPhoneDeactivated))

  const acsUsers = await seam.acs.users.list({
    user_identity_id: userIdentityId,
  })

  for (const acsUser of acsUsers) {
    const credentials = await seam.acs.credentials.list({
      acs_user_id: acsUser.acs_user_id,
    })

    for (const credential of credentials) {
      await seam.acs.credentials.delete({
        acs_credential_id: credential.acs_credential_id,
      })
    }

    await Promise.all(credentials.map(waitForAcsCredentialDeleted))

    await seam.acs.users.delete({ acs_user_id: acsUser.acs_user_id })
  }

  await Promise.all(acsUsers.map(waitForAcsUserDeleted))

  await seam.userIdentities.delete({
    user_identity_id: userIdentityId,
  })

  logger.info({ userIdentity }, 'Deleted user identity')
}

type AcsUser = AcsUsersGetResponse['acs_user']
type AcsCredential = AcsCredentialsGetResponse['acs_credential']
type EnrollmentAutomation =
  UserIdentitiesEnrollmentAutomationsGetResponse['enrollment_automation']
type Phone = PhonesListResponse['phones'][number]
type SeamEvent = EventsListResponse['events'][number]
type SeamEventType = EventsListParams['event_type']
