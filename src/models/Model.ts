// abstract class Model
// handles all the logic for the model
// and the data that is stored in the model with the help of pocketbase

import PocketBase from "pocketbase";

export default abstract class Model {
  // the name of the collection in the database
  protected collectionName: string;

  // the collection in the database
  protected collection: any;

  // the id of the model
  public id: string;
  //   public createdAt: Date | null;
  //   public updatedAt: Date | null;

  // the data of the model
  public data: any;

  // the constructor of the model
  // takes the id of the model
  constructor(id: string = "", collectionName: string = "default") {
    this.id = id;
    // this.createdAt = null;
    // this.updatedAt = null;
    this.collectionName = collectionName;

    const pb = new PocketBase("http://127.0.0.1:8090");
    this.collection = pb.collection(this.collectionName);

    if (this.id !== "") {
      this.getData();
    }
  }

  // the function to get the data of the model
  // returns the data of the model
  public async getData(): Promise<any> {
    this.data = await this.collection.getOne(this.id);
    return this.data;
  }

  // the function to get the id of the model
  // returns the id of the model
  public getId(): string {
    return this.id;
  }

  // the function to set the data of the model
  // takes the data of the model
  // returns the data of the model
  public setData(data: any): void {
    this.data = data;
  }

  // the function to create a new model
  // takes the data of the model
  // returns the data of the model
  public async create(data: any): Promise<string> {
    this.data = await this.collection.create(data);
    return this.data;
  }

  // the function to delete the model
  public async delete(): Promise<void> {
    if (this.id === "") {
      throw new Error("Model id is not set");
    }
    await this.collection.delete(this.id);
  }

  // the function to update the model
  // takes the data of the model
  // returns the data of the model
  public async save(): Promise<any> {
    if (this.id === "") {
      throw new Error("Model id is not set");
    }
    this.data = await this.collection.update(this.id, this.data);
    return this.data;
  }

  // the function to get the collection of the model
  // returns the collection of the model
  public getCollection(): any {
    return this.collection;
  }

  // the function to get the collection name of the model
  // returns the collection name of the model
  public getCollectionName(): string {
    return this.collectionName;
  }

  public async getAll(): Promise<any> {
    return await this.collection.getFullList();
  }

  public async getOne(id: string): Promise<any> {
    return await this.collection.getOne(id);
  }

  public async update(id: string, data: any): Promise<any> {
    return await this.collection.update(id, data);
  }

  public async deleteOne(id: string): Promise<any> {
    return await this.collection.delete(id);
  }

  public async createOne(data: any): Promise<any> {
    return await this.collection.create(data);
  }
}
