import { createSelector } from '@reduxjs/toolkit'
import { omit } from 'lodash'
import { RootState } from '../..'
import { WarmupExecutePayload } from './actions'
import { getSubscriptionKey } from './util'

const selectCacheWarmer = (state: RootState) => state.cacheWarmer
const selectCacheWarmerSubscriptions = createSelector(
  selectCacheWarmer,
  (state) => state.subscriptions,
)

export interface BatchWarmerSubscriptionKey {
  /**
   * If true, indicates the included key is from an existing subscription,
   * otherwise, it has been newly generated from the payload
   */
  existingKey: boolean
  key: string
}

export const selectBatchWarmerSubscriptionKey = createSelector(
  selectCacheWarmerSubscriptions,
  (_state: any, payload: WarmupExecutePayload) => payload,
  (subscriptions, payload) => {
    const batchWarmerSubscription = Object.entries(subscriptions).find(([, subscriptionState]) => {
      const isBatchWarmerSubscription = subscriptionState.childLastSeenById
      const isMatchingSubscription =
        subscriptionState.executeFn.toString() === payload.executeFn.toString()

      return isBatchWarmerSubscription && isMatchingSubscription
    })

    if (!batchWarmerSubscription) {
      return {
        existingKey: false,
        key: getSubscriptionKey(omit(payload, ['data'])),
      }
    }

    return {
      existingKey: true,
      key: batchWarmerSubscription[0],
    }
  },
)
