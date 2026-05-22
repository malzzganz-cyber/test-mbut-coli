import React, { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { getMusicPreference, saveMusicPreference } from "@/lib/firestore";
import { Button } from "./ui/button";

export const AudioPlayer = () => {
  const [muted, setMuted] = useState(getMusicPreference());
  const [audio] = useState(() => {
    const a = new Audio("https://files.catbox.moe/dwjqgv.mp3");
    a.loop = true;
    return a;
  });

  useEffect(() => {
    if (muted) {
      audio.pause();
    } else {
      audio.play().catch((err) => console.log("Autoplay blocked:", err));
    }
  }, [muted, audio]);

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    saveMusicPreference(newMuted);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed top-4 right-4 z-50 brutal-card rounded-full w-12 h-12 p-0"
      onClick={toggleMute}
    >
      {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
    </Button>
  );
};
