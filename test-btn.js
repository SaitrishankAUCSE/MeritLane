import React from "react";
import { renderToString } from "react-dom/server";
import { Button } from "./components/ui/Button";

console.log(renderToString(<Button href="/candidate/assessment">Start</Button>));
