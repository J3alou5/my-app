import { Account, Avatars, Client, Databases, ID, Query, Storage, Permission, Role } from "react-native-appwrite";


export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.jsm.try",
  projectId: "66f669360036504f3a59",
  databaseId: "66f66ae40034a10da3de",
  userCollectionId: "66f66b42001f835f2f73",
  videoCollectionId: "66f66b180010e18666e5",
  storageId: "66f66cae002e430fe4ad",
}

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
const storage = new Storage(client);


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
          [
            Permission.read(Role.user(form.userId)), 
            Permission.update(Role.user(form.userId)), 
            Permission.delete(Role.user(form.userId))
        ]
      );
      return newUser;
  } catch (error) {
      console.log(error);
      throw new Error(error);
  }
}

export const signIn = async (email, password) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    console.log('Session created:', session);
    
    const currentAccount = await account.get();
    console.log('Current Account after login:', currentAccount);
    
    return session;
  } catch (error) {
    console.error('Error during sign-in:', error);
    throw new Error(error);
  }
};

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

export const signOut = async () => {
  try {
     const session = await account.deleteSession('current')
     
     return session;
  } catch (error) {
      throw new Error(error)
  }
}
export const getFilePreview = async (fileId, type) => {
  let fileUrl;
  try {
      if(type === 'video'){
          fileUrl = storage.getFileView(storageId, fileId)
      }
      else if (type === 'image') {
          fileUrl = storage.getFilePreview(storageId, fileId, 2000, 2000, 'top', 100)
      }else {
          throw new Error('Invalid file type');
      }
      if(!fileUrl) throw Error;
      return fileUrl;
  } catch (error) {
      throw new Error(error);
  }
}
export const uploadFile = async (file, type) => {
  if(!file) return;
  const { mimeType, ...rest} = file;
  const asset = { 
      name: file.fileName,
      type: file.mimeType,
      size: file.fileSize,
      uri: file.uri
  }
  try {
      const uploadedFile = await storage.createFile(storageId, ID.unique(), asset)
      const fileUrl = await getFilePreview(uploadedFile.$id, type)
      return fileUrl;
  } catch (error) {
      throw new Error(error);
  }
}

export const createVideo = async (form) => {
  try {
    const currentAccount = await account.get();
    console.log("Current Account:", currentAccount);

    if (!currentAccount) {
      console.error("User is not authenticated.");
      return;
    }

    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, 'image'),
      uploadFile(form.video, 'video'),
    ]);

    const newPost = await databases.createDocument(
      databaseId,
      videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt: form.prompt,
        users: currentAccount.$id,
      },
      [
        Permission.read(Role.user(currentAccount.$id)),
        Permission.update(Role.user(currentAccount.$id)),
        Permission.delete(Role.user(currentAccount.$id)),
      ]
    );

    console.log("New Video Post Created:", newPost);
    return newPost;
  } catch (error) {
    console.error("Error in createVideo:", error);
    throw new Error(error);
  }
};




export { createUser };