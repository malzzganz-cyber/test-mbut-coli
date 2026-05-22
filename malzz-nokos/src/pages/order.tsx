import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useGetServices, useGetCountries, useGetOperators, useGetOrderStatus, useGetMarkup, getGetCountriesQueryKey, getGetOperatorsQueryKey, getGetOrderStatusQueryKey } from "@workspace/api-client-react";
import { createOrderDoc, updateOrderStatus, updateUserBalance, createTransaction } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { Copy, RefreshCw, XCircle } from "lucide-react";
import { ReviewModal } from "@/components/ReviewModal";
import { useQueryClient } from "@tanstack/react-query";

export default function Order() {
  const { user, userProfile, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  const [service, setService] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [country, setCountry] = useState("");
  const [operator, setOperator] = useState("");
  const [price, setPrice] = useState(0);
  
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [showReview, setShowReview] = useState(false);

  const { data: markupData } = useGetMarkup();
  const markup = markupData?.markup || 0;

  const { data: servicesData, isLoading: loadingServices } = useGetServices();
  const { data: countriesData, isLoading: loadingCountries } = useGetCountries(
    { service_id: service },
    { query: { enabled: !!service, queryKey: getGetCountriesQueryKey({ service_id: service }) } }
  );
  const { data: operatorsData, isLoading: loadingOperators } = useGetOperators(
    { country, provider_id: service },
    { query: { enabled: !!country && !!service, queryKey: getGetOperatorsQueryKey({ country, provider_id: service }) } }
  );

  const { data: orderStatus, isError: orderStatusError } = useGetOrderStatus(
    { order_id: activeOrder?.order_id || "" },
    { query: { enabled: !!activeOrder, refetchInterval: 5000, queryKey: getGetOrderStatusQueryKey({ order_id: activeOrder?.order_id || "" }) } }
  );

  useEffect(() => {
    if (orderStatus?.success && activeOrder) {
      if (orderStatus.otp && activeOrder.status !== "success") {
        setActiveOrder({ ...activeOrder, otp: orderStatus.otp, status: "success" });
        updateOrderStatus(activeOrder.order_id, "success", orderStatus.otp);
        toast.success("OTP Received!");
        setTimeout(() => setShowReview(true), 2000);
      }
      if (orderStatus.status === "cancel" && activeOrder.status !== "cancelled") {
        handleCancel(true);
      }
    }
  }, [orderStatus]);

  const handleOrder = async () => {
    if (!service || !country || !operator || !price) return;
    if ((userProfile?.balance || 0) < price) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      const params = new URLSearchParams({
        number_id: country,
        provider_id: service,
        operator_id: operator !== "any" ? operator : "",
        user_uid: user!.uid,
        service_id: service,
        service_name: serviceName,
        price: String(price),
      });
      if (operator === "any") params.delete("operator_id");
      const r = await fetch(`/api/rumahotp/orders/create?${params}`);
      const res = await r.json();

      if (res?.success) {
        const orderData = {
          order_id: res.order_id,
          number: res.number,
          serviceName,
          price,
          status: "pending"
        };
        await createOrderDoc(user!.uid, orderData);
        await updateUserBalance(user!.uid, userProfile.balance - price);
        await createTransaction(user!.uid, { type: "order", amount: -price, description: `Order ${serviceName}`, order_id: res.order_id });
        await refreshProfile();
        setActiveOrder(orderData);
        toast.success("Order created!");
      } else {
        toast.error(res?.error || "Failed to create order");
      }
    } catch (e: any) {
      toast.error("Error creating order");
    }
  };

  const handleCancel = async (auto = false) => {
    if (!activeOrder) return;
    try {
      // Refund
      await updateUserBalance(user!.uid, userProfile.balance + activeOrder.price);
      await createTransaction(user!.uid, { type: "refund", amount: activeOrder.price, description: `Refund Order ${activeOrder.serviceName}` });
      await updateOrderStatus(activeOrder.order_id, "cancelled");
      
      const url = `/api/rumahotp/orders/cancel?order_id=${activeOrder.order_id}&user_uid=${user!.uid}`;
      await fetch(url);
      
      await refreshProfile();
      setActiveOrder(null);
      if (!auto) toast.success("Order cancelled and refunded");
    } catch (e) {
      toast.error("Failed to cancel order");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-background pb-32">
      <div className="max-w-[420px] mx-auto p-4 pt-8 flex flex-col gap-6">
        <h1 className="text-3xl font-black border-b-4 border-black pb-2 inline-block self-start">New Order</h1>
        
        <div className="brutal-card p-4 flex justify-between items-center bg-black text-white">
          <span className="font-bold text-sm">Your Balance</span>
          <span className="font-black text-xl">Rp {(userProfile?.balance || 0).toLocaleString("id-ID")}</span>
        </div>

        {activeOrder ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="brutal-card bg-primary p-6 flex flex-col gap-6">
            <div className="text-center">
              <p className="font-bold text-sm mb-1 uppercase tracking-wider">Number</p>
              <h2 className="text-4xl font-black bg-white border-4 border-black py-3 rounded-xl cursor-pointer" onClick={() => copyToClipboard(activeOrder.number)}>
                +{activeOrder.number}
              </h2>
              <p className="text-xs font-bold mt-2 text-black/70">Tap to copy</p>
            </div>

            <div className="bg-white border-4 border-black p-4 rounded-xl text-center min-h-[100px] flex flex-col items-center justify-center">
              {activeOrder.otp ? (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: [1.2, 1] }} transition={{ duration: 0.5 }} className="flex flex-col gap-2 cursor-pointer" onClick={() => copyToClipboard(activeOrder.otp)}>
                  <p className="text-sm font-bold uppercase text-green-600">OTP Received</p>
                  <h3 className="text-4xl font-black text-black tracking-widest">{activeOrder.otp}</h3>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="w-8 h-8 animate-spin text-black/50" />
                  <p className="font-bold text-sm animate-pulse">Waiting for SMS...</p>
                </div>
              )}
            </div>

            {activeOrder.status !== "success" && (
              <Button onClick={() => handleCancel(false)} className="brutal-btn bg-destructive text-white h-12 mt-2">
                <XCircle className="mr-2 w-5 h-5" /> Cancel & Refund
              </Button>
            )}
            {activeOrder.status === "success" && (
              <Button onClick={() => setActiveOrder(null)} className="brutal-btn bg-white text-black h-12 mt-2">
                Buy Another Number
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-bold">Service</label>
              <Select onValueChange={(val) => {
                const s = (servicesData?.data as any[])?.find((x: any) => x.id === val);
                setService(val);
                setServiceName(s?.name || "");
                setCountry("");
                setOperator("");
                setPrice(0);
              }}>
                <SelectTrigger className="h-14 border-4 border-black rounded-xl font-bold bg-white text-lg">
                  <SelectValue placeholder="Select Service" />
                </SelectTrigger>
                <SelectContent className="border-4 border-black rounded-xl">
                  {servicesData?.data?.map((s: any) => (
                    <SelectItem key={s.id} value={s.id} className="font-bold">{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold">Country</label>
              <Select disabled={!service || loadingCountries} onValueChange={(val) => {
                setCountry(val);
                setOperator("");
                setPrice(0);
              }}>
                <SelectTrigger className="h-14 border-4 border-black rounded-xl font-bold bg-white text-lg">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent className="border-4 border-black rounded-xl">
                  {(countriesData?.data as any[])?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id} className="font-bold">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold">Operator</label>
              <Select disabled={!country || loadingOperators} onValueChange={(val) => {
                const op = (operatorsData?.data as any[])?.find((x: any) => x.id === val);
                setOperator(val);
                setPrice((op?.price || 0) + markup);
              }}>
                <SelectTrigger className="h-14 border-4 border-black rounded-xl font-bold bg-white text-lg">
                  <SelectValue placeholder="Select Operator" />
                </SelectTrigger>
                <SelectContent className="border-4 border-black rounded-xl">
                  {(operatorsData?.data as any[])?.map((o: any) => (
                    <SelectItem key={o.id} value={o.id} className="font-bold">{o.name} - Rp {o.price + markup}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {price > 0 && (
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="brutal-card bg-accent p-4 mt-4">
                <div className="flex justify-between items-center mb-2 text-sm font-bold">
                  <span>Price</span>
                  <span>Rp {price - markup}</span>
                </div>
                <div className="flex justify-between items-center mb-2 text-sm font-bold border-b-2 border-black pb-2">
                  <span>Platform Fee</span>
                  <span>Rp {markup}</span>
                </div>
                <div className="flex justify-between items-center text-xl font-black mt-2">
                  <span>Total</span>
                  <span>Rp {price}</span>
                </div>
              </motion.div>
            )}

            <Button 
              disabled={!price || price > (userProfile?.balance || 0)} 
              onClick={handleOrder}
              className="brutal-btn bg-secondary text-black h-14 text-xl mt-4 w-full"
            >
              Order Number
            </Button>
          </div>
        )}
      </div>
      <ReviewModal open={showReview} onOpenChange={setShowReview} />
    </motion.div>
  );
}
