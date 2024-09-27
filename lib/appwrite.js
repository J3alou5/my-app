import {Account,Avatars,Client,Databases,ID,Query,Storage,} from "react-native-appwrite";
import { Pressable } from 'react-native';

export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.jsm.try",
  projectId: "66f669360036504f3a59",
  databaseId: "66f66ae40034a10da3de",
  userCollectionId: "66f66b42001f835f2f73",
  videoCollectionId: "66f66b180010e18666e5",
  storageId: "66f66cae002e430fe4ad",
};

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  videoCollectionId,
  storageId,
} = appwriteConfig

const client = new Client();

client
  .setEndpoint(endpoint) 
  .setProject(projectId) 
  .setPlatform(platform) 
;



const account = new Account(client);
const databases = new Databases(client);
const avatars = new Avatars(client);

const createUser = async (email, password, username) => {
  try {
      const newAccount = await account.create(
          ID.unique(),
          email,
          password,
          username
      )

      if(!newAccount) throw Error;

      const avatarUrl = avatars.getInitials(username)
      await signIn(email, password)

      const newUser = await databases.createDocument(
          databaseId,
          userCollectionId,
          ID.unique(),
          {
          accountId: newAccount.$id,
          email: email,
          username: username,
          avatar: avatarUrl
          }
      );
      return newUser;
  } catch (error) {
      console.log(error);
      throw new Error(error);
  }
}

export const signIn = async (email, password) => {
  try {
      const session = await account.createEmailPasswordSession(email, password)

      return session;
  } catch (error) {
      throw new Error(error);
  }
}

export const getCurrentUser = async () => {
  try {
      const currentAccount = await account.get();

      if(!currentAccount) throw Error;

      const currentUser = await databases.listDocuments(databaseId, userCollectionId,
      [Query.equal('accountId', currentAccount.$id)])

      if(!currentUser) throw Error;

      return currentUser.documents[0];
  } catch (error) {
      console.log(error)
  }
}

export const getAllPosts = async () => {
  try {
   const posts = await databases.listDocuments(
      databaseId,
      videoCollectionId
   )
   return posts.documents;
  } catch (error) {
      throw new Error(error);
  }
}

export const searchPosts = async (query) => {
  try {
   const posts = await databases.listDocuments(
      databaseId,
      videoCollectionId,
      [Query.search('title', query)]
   )
   return posts.documents;
  } catch (error) {
      throw new Error(error);
  }
}

export const getLatestPosts = async () => {
  try {
   const posts = await databases.listDocuments(
      databaseId,
      videoCollectionId,
      [Query.orderDesc('$createdAt'), Query.limit(7)]
   )
   return posts.documents;
  } catch (error) {
      throw new Error(error);
  }
}

export const getUserPosts = async (userId) => {
  try {
   const posts = await databases.listDocuments(
      databaseId,
      videoCollectionId,
      [Query.equal('users', userId)]
   )
   return posts.documents;
  } catch (error) {
      throw new Error(error);
  }
}

export const logOut = async () => {
  try {
     const session = await account.deleteSession('current')
     
     return session;
  } catch (error) {
      throw new Error(error)
  }
}



export { createUser };
