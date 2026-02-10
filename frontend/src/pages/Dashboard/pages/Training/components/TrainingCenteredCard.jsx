import React from "react";

const TrainingCenteredCard = ({ title, message, children }) => {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center">
      <div className="card bg-base-200 border border-base-300 w-full max-w-xl">
        <div className="card-body items-center text-center">
          {title ? <h1 className="text-3xl font-bold">{title}</h1> : null}
          {message ? <p className="opacity-80">{message}</p> : null}
          {children}
        </div>
      </div>
    </div>
  );
};

export default TrainingCenteredCard;
