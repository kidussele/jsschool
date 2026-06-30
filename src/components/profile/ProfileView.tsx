"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAppStore } from "@/lib/store";
import { useState, useEffect } from "react";
import {
  User,
  Zap,
  Trophy,
  Flame,
  Calendar,
  Edit3,
  Save,
  X,
  CheckCircle2,
  LogIn,
  LogOut,
  Trash2,
  Lock,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileView() {
  const { user, setUser, navigateTo } = useAppStore();

  // Profile edit
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editing, setEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState("");

  // Delete
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditBio((user as unknown as Record<string, unknown>)?.bio as string || "");
      setEditAvatar(user.avatar || "");
    }
  }, [user]);

  const xp = user?.xp ?? 0;
  const level = Math.floor(xp / 500) + 1;
  const streak = user?.streak ?? 0;
  const coins = user?.coins ?? 0;

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    setProfileMsg("");
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name: editName.trim(),
          bio: editBio.trim(),
          avatar: editAvatar.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.user) {
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          avatar: data.user.avatar,
          xp: data.user.xp,
          coins: data.user.coins,
          streak: data.user.streak,
          role: data.user.role,
        });
        setEditing(false);
        setProfileMsg("Profile updated successfully!");
      } else if (data.error) {
        setProfileMsg(data.error);
      }
    } catch {
      setProfileMsg("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    if (newPassword !== confirmPassword) {
      setPwdMsg("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPwdMsg("New password must be at least 6 characters.");
      return;
    }
    setChangingPwd(true);
    setPwdMsg("");
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (data.message) {
        setPwdMsg("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else if (data.error) {
        setPwdMsg(data.error);
      }
    } catch {
      setPwdMsg("Failed to change password.");
    } finally {
      setChangingPwd(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.message) {
        setUser(null);
        navigateTo("home");
      }
    } catch {
      // silent
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    navigateTo("home");
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="h-20 w-20 rounded-3xl bg-js-yellow/10 flex items-center justify-center mx-auto mb-6">
            <User className="h-10 w-10 text-js-yellow" />
          </div>
          <h1 className="text-2xl font-extrabold mb-2">Join JavaScript Hero Academy</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Create your profile to start tracking progress and earning XP
          </p>
          <div className="space-y-3">
            <Button
              className="w-full bg-js-yellow text-js-darker hover:bg-js-yellow/90 font-bold rounded-xl h-12 gap-2"
              onClick={() => navigateTo("login")}
            >
              <LogIn className="h-4 w-4" />Sign In
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-xl h-12"
              onClick={() => navigateTo("register")}
            >
              Create Account
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Card className="overflow-hidden">
          <div className="h-28 sm:h-36 bg-gradient-to-r from-js-yellow/20 via-js-sky/20 to-js-violet/20" />
          <CardContent className="p-6 -mt-12 sm:-mt-14">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-lg">
                <AvatarFallback className="bg-js-yellow/20 text-js-yellow text-xl font-extrabold">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-0.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold">{user.name}</h1>
                  <Badge className="bg-js-yellow/10 text-js-yellow border-js-yellow/20 text-xs">
                    Level {level}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={handleLogout}
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total XP", value: xp.toLocaleString(), icon: Zap, color: "text-js-yellow", bg: "bg-js-yellow/10" },
          { label: "Level", value: level, icon: Trophy, color: "text-js-sky", bg: "bg-js-sky/10" },
          { label: "Day Streak", value: streak, icon: Flame, color: "text-js-rose", bg: "bg-js-rose/10" },
          { label: "Coins", value: coins, icon: Coins, color: "text-js-emerald", bg: "bg-js-emerald/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Card>
              <CardContent className="p-4 text-center">
                <div className={cn("inline-flex items-center justify-center h-10 w-10 rounded-xl mb-2", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div className={cn("text-xl font-extrabold", stat.color)}>{stat.value}</div>
                <div className="text-[11px] text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Edit Profile */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-js-sky" />
                Edit Profile
              </CardTitle>
              {!editing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1"
                  onClick={() => setEditing(true)}
                >
                  <Edit3 className="h-3 w-3" />Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                disabled={!editing}
                className="h-10 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Bio</Label>
              <Input
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                disabled={!editing}
                placeholder="Tell us about yourself..."
                className="h-10 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Avatar URL</Label>
              <Input
                value={editAvatar}
                onChange={(e) => setEditAvatar(e.target.value)}
                disabled={!editing}
                placeholder="https://example.com/avatar.png"
                className="h-10 rounded-xl"
              />
            </div>
            {profileMsg && (
              <p className={cn("text-sm", profileMsg.includes("successfully") ? "text-emerald-500" : "text-rose-500")}>
                {profileMsg}
              </p>
            )}
            {editing && (
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(false);
                    setEditName(user.name);
                    setEditBio((user as unknown as Record<string, unknown>)?.bio as string || "");
                    setEditAvatar(user.avatar || "");
                    setProfileMsg("");
                  }}
                >
                  <X className="h-3.5 w-3.5 mr-1" />Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-js-sky hover:bg-js-sky/90 text-white font-bold rounded-xl gap-1"
                  onClick={handleSaveProfile}
                  disabled={savingProfile || !editName.trim()}
                >
                  <Save className="h-3.5 w-3.5" />
                  {savingProfile ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Lock className="h-4 w-4 text-js-violet" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
            {pwdMsg && (
              <p className={cn("text-sm", pwdMsg.includes("successfully") ? "text-emerald-500" : "text-rose-500")}>
                {pwdMsg}
              </p>
            )}
            <div className="flex justify-end">
              <Button
                size="sm"
                className="bg-js-violet hover:bg-js-violet/90 text-white font-bold rounded-xl gap-1"
                onClick={handleChangePassword}
                disabled={changingPwd || !currentPassword || !newPassword || !confirmPassword}
              >
                <Lock className="h-3.5 w-3.5" />
                {changingPwd ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-rose-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-rose-500">
              <Trash2 className="h-4 w-4" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete your account, there is no going back. All your data, progress, and achievements will be permanently removed.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:text-rose-500 gap-1.5"
                  disabled={deleting}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {deleting ? "Deleting..." : "Delete Account"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove all of your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-rose-500 hover:bg-rose-600 text-white"
                  >
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}