import React from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth-context";

import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Order from "@/pages/order";
import Deposit from "@/pages/deposit";
import History from "@/pages/history";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";
import Support from "@/pages/support";

import AdminBalance from "@/pages/admin-balance";
import AdminMarkup from "@/pages/admin-markup";
import AdminWithdraw from "@/pages/admin-withdraw";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BottomNav } from "@/components/BottomNav";
import { AudioPlayer } from "@/components/AudioPlayer";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AudioPlayer />
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Switch>
            <Route path="/" component={Landing} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            
            <Route path="/dashboard"><ProtectedRoute><Dashboard /></ProtectedRoute></Route>
            <Route path="/order"><ProtectedRoute><Order /></ProtectedRoute></Route>
            <Route path="/deposit"><ProtectedRoute><Deposit /></ProtectedRoute></Route>
            <Route path="/history"><ProtectedRoute><History /></ProtectedRoute></Route>
            <Route path="/leaderboard"><ProtectedRoute><Leaderboard /></ProtectedRoute></Route>
            <Route path="/profile"><ProtectedRoute><Profile /></ProtectedRoute></Route>
            <Route path="/support"><ProtectedRoute><Support /></ProtectedRoute></Route>

            <Route path="/admin/balance"><AdminBalance /></Route>
            <Route path="/admin/markup"><AdminMarkup /></Route>
            <Route path="/admin/withdraw"><AdminWithdraw /></Route>

            <Route component={NotFound} />
          </Switch>
          <BottomNav />
        </WouterRouter>
        <Toaster position="top-center" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
