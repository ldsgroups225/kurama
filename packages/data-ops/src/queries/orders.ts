import { eq, and, desc } from "drizzle-orm";
import { getDb } from "../database/setup";
import {
  orders,
  type InsertOrder,
  type SelectOrder,
  type OrderStatus,
} from "../drizzle/schema";

/**
 * Create a new order
 */
export async function createOrder(data: InsertOrder): Promise<SelectOrder | null> {
  const db = getDb();
  const now = new Date().toISOString();

  const result = await db
    .insert(orders)
    .values({
      ...data,
      createdAt: now,
    })
    .onConflictDoNothing()
    .returning();

  return result[0] || null;
}

/**
 * Get order by ID
 */
export async function getOrderById(id: string): Promise<SelectOrder | null> {
  const db = getDb();

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
  });

  return order || null;
}

/**
 * Get all orders for a user
 */
export async function getUserOrders(userId: string): Promise<SelectOrder[]> {
  const db = getDb();

  const userOrders = await db.query.orders.findMany({
    where: eq(orders.userId, userId),
    orderBy: [desc(orders.createdAt)],
  });

  return userOrders;
}

/**
 * Get orders by subscription ID
 */
export async function getOrdersBySubscription(subscriptionId: string): Promise<SelectOrder[]> {
  const db = getDb();

  const subscriptionOrders = await db.query.orders.findMany({
    where: eq(orders.subscriptionId, subscriptionId),
    orderBy: [desc(orders.createdAt)],
  });

  return subscriptionOrders;
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  additionalData?: Partial<InsertOrder>
): Promise<SelectOrder | null> {
  const db = getDb();

  const result = await db
    .update(orders)
    .set({
      status,
      ...additionalData,
    })
    .where(eq(orders.id, id))
    .returning();

  return result[0] || null;
}

/**
 * Mark order as paid
 */
export async function markOrderPaid(id: string): Promise<SelectOrder | null> {
  const db = getDb();
  const now = new Date().toISOString();

  const result = await db
    .update(orders)
    .set({
      status: 'paid',
      paidAt: now,
    })
    .where(eq(orders.id, id))
    .returning();

  return result[0] || null;
}

/**
 * Mark order as refunded
 */
export async function markOrderRefunded(id: string): Promise<SelectOrder | null> {
  const db = getDb();
  const now = new Date().toISOString();

  const result = await db
    .update(orders)
    .set({
      status: 'refunded',
      refundedAt: now,
    })
    .where(eq(orders.id, id))
    .returning();

  return result[0] || null;
}

/**
 * Get user's total spent amount
 */
export async function getUserTotalSpent(userId: string): Promise<number> {
  const db = getDb();

  const paidOrders = await db.query.orders.findMany({
    where: and(
      eq(orders.userId, userId),
      eq(orders.status, 'paid')
    ),
    columns: {
      amount: true,
    },
  });

  return paidOrders.reduce((total, order) => total + order.amount, 0);
}

/**
 * Check if user has made any purchase
 */
export async function hasUserPurchased(userId: string): Promise<boolean> {
  const db = getDb();

  const order = await db.query.orders.findFirst({
    where: and(
      eq(orders.userId, userId),
      eq(orders.status, 'paid')
    ),
  });

  return order !== undefined;
}
