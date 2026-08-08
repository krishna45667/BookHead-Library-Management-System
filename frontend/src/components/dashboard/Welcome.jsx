import React from "react";

const Welcome = ({ username }) => {
  return (
    <div className="mb-2">
      <h1 className="text-3xl sm:text-4xl font-bold text-zinc-50 tracking-tight">
        Welcome back, {username || "User"}{" "}
        <span className="inline-block">👋</span>
      </h1>

      <p className="text-zinc-400 mt-2 text-base">
        Here's what's happening in your library today.
      </p>
    </div>
  );
};

export default Welcome;