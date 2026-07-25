import { useRef, useState } from "react";
import { Button } from "./components/ui/button";
import "./index.css";
import axios from "axios";

export function App() {
  const BACKEND_URL = "http://localhost:4000";
  const [selectedLanguage, setSelectedLanguage] = useState("cpp");
  const codeRef = useRef<HTMLTextAreaElement>(null);
  const [codeOutput, setCodeOutput] = useState("");

  async function pollBackend(submissionId: string) {
    const response = await axios.get(
      `${BACKEND_URL}/submission/${submissionId}`,
    );

    if (response.data.submission.status === "PENDING") {
      setCodeOutput("Running...")
      await new Promise((r) => setTimeout(r, 3000));

      pollBackend(submissionId);
    }

    if (response.data.submission.status === "SUCCESS") {
      console.log("Setting the code output...")
      setCodeOutput(response.data.submission.output);
      console.log("Code output set to: " + response.data.submission.output)
    }

  }

  async function submitCode() {
    console.log("Submitting the code...");
    const response = await axios.post(`${BACKEND_URL}/submission`, {
      language: selectedLanguage,
      code: codeRef.current!.value,
    });

    await pollBackend(response.data.submissionId)
  }

  return (
    <div>
      <div className="h-screen w-screen flex">
        {/* left part */}
        <div className="flex-1 bg-red-300">
          <div className="flex justify-between">
            <div>
              <Button
                variant={selectedLanguage === "cpp" ? "destructive" : "outline"}
                onClick={() => {
                  setSelectedLanguage("cpp");
                }}
              >
                Cpp
              </Button>
              <Button
                variant={selectedLanguage === "js" ? "destructive" : "outline"}
                onClick={() => {
                  setSelectedLanguage("js");
                }}
              >
                JS
              </Button>
              <Button
                variant={selectedLanguage === "py" ? "destructive" : "outline"}
                onClick={() => {
                  setSelectedLanguage("py");
                }}
              >
                Python
              </Button>
            </div>

            <div>
              <Button onClick={submitCode}>Submit</Button>
            </div>
          </div>
          <textarea
            ref={codeRef}
            className="w-full h-full rows-500 border-2 border-black"
          />
        </div>

        {/* right part */}
        <div className="flex-1 bg-green-300">{codeOutput}</div>
      </div>
    </div>
  );
}

export default App;
