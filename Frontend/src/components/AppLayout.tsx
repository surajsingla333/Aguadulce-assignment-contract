/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import NavBar from "./NavBar";

const AppLayout = ({ children }: any) => {
  return (
    <Fragment>
      <div>
        <NavBar />

        <div className="mt-20">{children}</div>
      </div>
    </Fragment>
  );
};

export default AppLayout;
