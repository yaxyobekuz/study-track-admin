// Lottie
import Lottie from "lottie-react";

// Router
import { Link } from "react-router-dom";

// Hooks
import useSteps from "../hooks/useSteps";

// Components
import StepBars from "@/shared/components/ui/StepBars";

// Icons
import { ChevronLeft, ChevronsRight } from "lucide-react";

// Components
import { Button } from "@/shared/components/shadcn/button";

const GetStartedPage = () => {
  const { currentStep, isLastStep, isFirstStep, steps } = useSteps();

  return (
    <div
      key={currentStep.number}
      className="container h-screen animate__animated animate__fadeIn"
    >
      {/* Top */}
      <div className="flex items-center gap-3.5 h-[60px]">
        {/* Back button */}
        <Link
          to={
            isFirstStep ? undefined : `/get-started/${currentStep.number - 1}`
          }
          className="flex items-center justify-center w-10 h-7 shrink-0 rounded-lg bg-gray-100 transition-colors duration-200 hover:bg-gray-200"
        >
          <ChevronLeft strokeWidth={1.5} size={20} />
        </Link>

        {/* Step Bars */}
        <StepBars totalSteps={steps.length} currentStep={currentStep} />

        {/* Skip button */}
        <Link
          to="/register"
          className="flex items-center justify-center w-10 h-7 shrink-0 rounded-lg bg-gray-100 transition-colors duration-200 hover:bg-gray-200"
        >
          <ChevronsRight strokeWidth={1.5} size={20} />
        </Link>
      </div>

      {/* Content */}
      <div className="flex flex-col text-center h-[calc(100vh-152px)] overflow-y-auto">
        <div className="flex items-center justify-center grow">
          <Lottie
            className="w-full px-12 xs:px-24"
            animationData={currentStep.animationData}
          />
        </div>

        <div className="space-y-3.5 py-4 text-center">
          <h1 className="text-xl font-semibold">{currentStep.title}</h1>
          <p className="text-gray-500">{currentStep.description}</p>
        </div>
      </div>

      {/* Navigation button */}
      <div className="flex pt-4 gap-3.5 h-[92px]">
        <Button className="w-full" asChild>
          <Link
            to={
              isLastStep ? "/login" : `/get-started/${currentStep.number + 1}`
            }
          >
            {currentStep.button}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default GetStartedPage;
