import { db } from '../db';
import { user as userTable, account as accountTable, type User, type NewUser } from '../schema';
import { eq } from 'drizzle-orm';

export class UserService {
  static async createUser(userData: NewUser): Promise<User> {
    const result = await db.insert(userTable).values(userData).returning();
    return result[0];
  }

  static async updateUserGoogleId(id: string, googleId: string): Promise<User | null> {
    const result = await db
      .update(userTable)
      .set({ googleId })
      .where(eq(userTable.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : null;
  }

  static async getUserById(id: string): Promise<User | null> {
    const [user] = await db.select().from(userTable).where(eq(userTable.id, id)).limit(1);
    return user || null;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(userTable).where(eq(userTable.email, email)).limit(1);
    return user || null;
  }

  static async getUserByGoogleId(googleId: string): Promise<User | null> {
    const [user] = await db.select().from(userTable).where(eq(userTable.googleId, googleId)).limit(1);
    return user || null;
  }

  static async updateUser(id: string, userData: Partial<NewUser>): Promise<User | null> {
    const [user] = await db
      .update(userTable)
      .set(userData)
      .where(eq(userTable.id, id))
      .returning();
    return user || null;
  }

  static async getAllUsers(): Promise<User[]> {
    const rows = await db
      .select({
        user: userTable,
        account: accountTable,
      })
      .from(userTable)
      .leftJoin(accountTable, eq(userTable.id, accountTable.userId));

    const userMap = new Map<string, User>();
    
    for (const row of rows) {
      const u = row.user;
      const acc = row.account;
      
      const existing = userMap.get(u.id);
      if (existing) {
        if (acc && acc.providerId === 'google') {
          existing.googleId = acc.accountId;
        }
      } else {
        const userObj = { ...u };
        if (acc && acc.providerId === 'google') {
          userObj.googleId = acc.accountId;
        }
        userMap.set(u.id, userObj);
      }
    }
    
    return Array.from(userMap.values());
  }

  static async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(userTable).where(eq(userTable.id, id)).returning();
    return result.length > 0;
  }
}
