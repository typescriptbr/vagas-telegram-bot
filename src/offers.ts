import { ObjectId, Collection, Db } from 'mongodb'

export type Offer = {
  _id: ObjectId
  authorId: number
  authorName: string
  text: string
  status: 'pending' | 'approved' | 'rejected'
  statusSetBy: null | number
  createdAt: Date
}

export class Offers {
  #collection: Collection<Offer>

  constructor(db: Db) {
    this.#collection = db.collection('offers')
  }

  async create(authorId: number, authorName: string, text: string): Promise<Offer> {
    const offer: Omit<Offer, '_id'> = {
      authorId,
      authorName,
      text,
      status: 'pending',
      statusSetBy: null,
      createdAt: new Date()
    }

    const result = await this.#collection.insertOne(offer)

    return {
      ...offer,
      _id: result.insertedId
    }
  }

  async findById(id: string): Promise<Offer | null> {
    return this.#collection.findOne({ _id: new ObjectId(id) })
  }

  async approve(id: string, userId: number): Promise<void> {
    await this.#collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'approved', statusSetBy: userId } }
    )
  }

  async reject(id: string, userId: number): Promise<void> {
    await this.#collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'rejected', statusSetBy: userId } }
    )
  }
}
