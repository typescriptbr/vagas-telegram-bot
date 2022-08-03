import { ObjectId, Collection, Database } from "x/mongo@v0.31.0/mod.ts";

export type Offer = {
  _id: ObjectId;
  authorId: number;
  authorName: string;
  text: string;
  status: "pending" | "approved" | "rejected";
  statusSetBy: null | number;
  createdAt: Date;
};

export class Offers {
  #collection: Collection<Offer>;

  constructor(db: Database) {
    this.#collection = db.collection("offers");
  }

  async create(
    authorId: number,
    authorName: string,
    text: string
  ): Promise<Offer> {
    const offer: Omit<Offer, "_id"> = {
      authorId,
      authorName,
      text,
      status: "pending",
      statusSetBy: null,
      createdAt: new Date(),
    };

    const result = await this.#collection.insertOne(offer);

    return {
      ...offer,
      _id: result,
    };
  }

  async findById(id: string) {
    return this.#collection.findOne({ _id: new ObjectId(id) });
  }

  async approve(id: string, userId: number): Promise<void> {
    await this.#collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "approved", statusSetBy: userId } }
    );
  }

  async reject(id: string, userId: number): Promise<void> {
    await this.#collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "rejected", statusSetBy: userId } }
    );
  }
}
