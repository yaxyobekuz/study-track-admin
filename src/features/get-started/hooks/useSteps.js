// Data
import stepsData from "../data/steps.data";

// Roter
import { useParams } from "react-router-dom";

const useSteps = () => {
  const { stepNumber } = useParams();

  const formattedStepNumber = Math.min(
    parseInt(stepNumber) || 1,
    stepsData.length,
  );

  const currentStep = stepsData.find(
    (step) => step.number === formattedStepNumber,
  );

  const isLastStep = formattedStepNumber === stepsData.length;

  return {
    isLastStep,
    currentStep,
    steps: stepsData,
    totalSteps: stepsData.length,
    isFirstStep: formattedStepNumber === 1,
  };
};

export default useSteps;
