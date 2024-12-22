import { Client, Account, ID, Avatars, Databases } from 'react-native-appwrite';

export const appwriteConfig = {
  endpoint: 'https://cloud.appwrite.io/v1',
  platform: 'com.rn.streamly',
  projectId: '67682ced00358cff1ea2',
  databaseId: '6768307a0017774e89a3',
  userCollectionId: '676830ec00068550fd1b',
  videoCollectionId: '67683166002f5e3a9428',
  storageId: '676834e20014528004f2',
};

// Init your React Native SDK
const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw new Error('Failed to create user');
    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    console.error(error);
    throw new error(error);
  }
};

export async function signIn(email, password) {
  try {
    const session = await account.createEmailSession(email, password);
    return session;
  } catch (error) {
    throw new Error(error);
  }
}
