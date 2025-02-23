import { subscriptionTiers } from "@/data/subscriptionTiers"
import { db } from "@/drizzle/db"
import { UserSubscriptionTable } from "@/drizzle/schema"
import { CACHE_TAGS, dbCache, getUserTag, revalidateDbCache } from "@/lib/cache"
import { eq, SQL } from "drizzle-orm"

export async function createUserSubscription(
  data: typeof UserSubscriptionTable.$inferInsert
) {
  const [newSubscription] = await db
    .insert(UserSubscriptionTable)
    .values(data)
    .onConflictDoNothing({
      target: UserSubscriptionTable.clerkUserId,
    })
    .returning({
      id: UserSubscriptionTable.id,
      userId: UserSubscriptionTable.clerkUserId,
    })

  if (newSubscription != null) {
    revalidateDbCache({
      tag: CACHE_TAGS.subscription,
      id: newSubscription.id,
      userId: newSubscription.userId,
    })
  }

  return newSubscription
}

export function getUserSubscription(userId: string) {
  const cacheFn = dbCache(getUserSubscriptionInternal, {
    tags: [getUserTag(userId, CACHE_TAGS.subscription)],
  })

  return cacheFn(userId)
}

export async function updateUserSubscription(
  where: SQL,
  data: Partial<typeof UserSubscriptionTable.$inferInsert>
) {
  const [updatedSubscription] = await db
    .update(UserSubscriptionTable)
    .set(data)
    .where(where)
    .returning({
      id: UserSubscriptionTable.id,
      userId: UserSubscriptionTable.clerkUserId,
    })

  if (updatedSubscription != null) {
    revalidateDbCache({
      tag: CACHE_TAGS.subscription,
      userId: updatedSubscription.userId,
      id: updatedSubscription.id,
    })
  }
}

export async function updateUserSubscriptionTier(userId: string, newTier: keyof typeof subscriptionTiers) {
  // Validate if the provided tier exists
  if (!subscriptionTiers[newTier]) {
    throw new Error(`Invalid subscription tier: ${newTier}`);
  }

  // Update the user's subscription tier in the database
  const [updatedSubscription] = await db
    .update(UserSubscriptionTable)
    .set({ tier: newTier })
    .where(eq(UserSubscriptionTable.clerkUserId, userId))
    .returning({
      id: UserSubscriptionTable.id,
      userId: UserSubscriptionTable.clerkUserId,
      tier: UserSubscriptionTable.tier,
    });

  if (!updatedSubscription) {
    throw new Error("Failed to update subscription tier");
  }

  // Revalidate cache to ensure the change is reflected
  revalidateDbCache({
    tag: CACHE_TAGS.subscription,
    userId: updatedSubscription.userId,
    id: updatedSubscription.id,
  });

  return updatedSubscription;
}

export async function getUserSubscriptionTier(userId: string) {
  const subscription = await getUserSubscription(userId)

  if (subscription == null) throw new Error("User has no subscription")

  return subscriptionTiers[subscription.tier]
}

function getUserSubscriptionInternal(userId: string) {
  return db.query.UserSubscriptionTable.findFirst({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
  })
}