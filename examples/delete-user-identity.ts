import type { Builder, Command, Describe } from 'landlubber'

import type { AcsCredentialsListResponse } from '@seamapi/http/connect'

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
  const waitForEvent =
    (eventType: string, idKey: string) =>
    async (resource: any): Promise<void> => {
      // Application architecture specific logic that waits for an event matching
      // event.event_type === eventType && event[idKey] === resource[idKey]
      // In this example, the event may arrive before this function is called,
      // so any implementation must handle that case.
      logger.info({ eventType, idKey, resource }, 'Got event')
    }

  const clientSessions = await seam.clientSessions.list({
    // param not implemented
    user_identity_id: userIdentityId,
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
    // endpoint not implemented
    await seam.userIdentities.enrollmentAutomations.delete({
      enrollment_automation_id: enrollmentAutomation.enrollment_automation_id,
    })
  }

  await Promise.all(
    enrollmentAutomations.map(
      // event not implemented
      waitForEvent('enrollment_automation.deleted', 'enrollment_automation_id'),
    ),
  )

  const phones = await seam.phones.list({
    owner_user_identity_id: userIdentityId,
  })

  for (const phone of phones) {
    await seam.phones.deactivate({
      device_id: phone.device_id,
    })
  }

  // event not implemented
  await Promise.all(phones.map(waitForEvent('phone.deactivated', 'device_id')))

  for (const phone of phones) {
    await seam.devices.delete({
      device_id: phone.device_id,
    })
  }

  const acsUsers = await seam.acs.users.list({
    user_identity_id: userIdentityId,
  })

  const deletedCredentials: AcsCredentialsListResponse['acs_credentials'] = []

  for (const acsUser of acsUsers) {
    const credentials = await seam.acs.credentials.list({
      acs_user_id: acsUser.acs_user_id,
    })

    for (const credential of credentials) {
      await seam.acs.credentials.delete({
        acs_credential_id: credential.acs_credential_id,
      })
    }

    deletedCredentials.concat(credentials)
  }

  // event not implemented
  await Promise.all(
    deletedCredentials.map(waitForEvent('acs_user.deleted', 'acs_user_id')),
  )

  // event not implemented
  await Promise.all(
    deletedCredentials.map(
      waitForEvent('acs_credential.deleted', 'acs_credential_id'),
    ),
  )

  await seam.userIdentities.delete({
    user_identity_id: userIdentityId,
  })
}
