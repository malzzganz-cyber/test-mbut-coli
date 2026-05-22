import { doc, getDoc, setDoc, updateDoc, collection, addDoc, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { db } from "./firebase";

export const getUserProfile = async (uid: string) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const updateUserBalance = async (uid: string, newBalance: number) => {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, { balance: newBalance });
};

export const createOrderDoc = async (uid: string, orderData: any) => {
  const orderRef = doc(db, "orders", orderData.order_id);
  await setDoc(orderRef, { ...orderData, uid, createdAt: new Date().toISOString() });
  return orderData.order_id;
};

export const updateOrderStatus = async (orderId: string, status: string, otp?: string) => {
  const orderRef = doc(db, "orders", orderId);
  const data: any = { status };
  if (otp) data.otp = otp;
  await updateDoc(orderRef, data);
};

export const createTransaction = async (uid: string, txData: any) => {
  const txRef = collection(db, "transactions");
  await addDoc(txRef, { ...txData, uid, createdAt: new Date().toISOString() });
};

export const getTransactions = async (uid: string, count: number = 20) => {
  const q = query(collection(db, "transactions"), where("uid", "==", uid), orderBy("createdAt", "desc"), limit(count));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createDepositDoc = async (uid: string, depositData: any) => {
  const depositRef = doc(db, "deposits", depositData.deposit_id);
  await setDoc(depositRef, { ...depositData, uid, createdAt: new Date().toISOString(), status: "pending" });
};

export const updateDepositStatus = async (depositId: string, status: string) => {
  const depositRef = doc(db, "deposits", depositId);
  await updateDoc(depositRef, { status });
};

export const getLeaderboard = async () => {
  const q = query(collection(db, "users"), orderBy("totalOrders", "desc"), limit(10));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addReview = async (uid: string, reviewData: any) => {
  await addDoc(collection(db, "reviews"), { ...reviewData, uid, createdAt: new Date().toISOString() });
};

export const getReviews = async (count: number = 10) => {
  const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"), limit(count));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const saveMusicPreference = (muted: boolean) => {
  localStorage.setItem("malzz_music_muted", String(muted));
};

export const getMusicPreference = () => {
  return localStorage.getItem("malzz_music_muted") === "true";
};
