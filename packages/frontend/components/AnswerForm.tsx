import {
  Box,
  Button,
  Center,
  Checkbox,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Spinner,
  Stack,
  useControllableState,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Answer, FormTemplate } from "../constants/constants";
import { useAnswerForm } from "../hooks/useAnswerForm";
import { useLitCeramic } from "../hooks/useLitCeramic";

type AnswerInForm = Omit<Answer, "question_id">;

const FormInput = ({
  question,
  answer,
  setAnswer,
}: {
  question: FormTemplate["questions"][number];
  answer?: AnswerInForm;
  setAnswer: (a: AnswerInForm) => void;
}) => {
  const answerParams = {
    question_type: question.question_type,
  };

  const currentSingleAnswer =
    typeof answer?.answer === "object" ? "" : answer?.answer || "";
  const currentMultiAnswer =
    typeof answer?.answer === "object" ? answer?.answer : [] || [];

  switch (question.question_type) {
    case "text":
      return (
        <Input
          mt={8}
          placeholder="Answer Here"
          value={currentSingleAnswer}
          onChange={(e) =>
            setAnswer({ ...answerParams, answer: e.target.value })
          }
        />
      );
    case "single_choice":
      return (
        <RadioGroup
          value={currentSingleAnswer}
          onChange={(v) => setAnswer({ ...answerParams, answer: v })}
        >
          <Stack>
            {question.options.map((option, i) => (
              <Radio size="lg" key={i} value={option.text}>
                <Box color="white">{Object.values(option)[0] || ""}</Box>
              </Radio>
            ))}
          </Stack>
        </RadioGroup>
      );
    case "multi_choice":
      return (
        <Stack>
          {question.options.map((option, i) => (
            <Checkbox
              isChecked={currentMultiAnswer.includes(option.text)}
              onChange={(e) => {
                const checked = e.target.checked;
                if (checked) {
                  setAnswer({
                    ...answerParams,
                    answer: [...currentMultiAnswer, option.text],
                  });
                } else {
                  setAnswer({
                    ...answerParams,
                    answer: currentMultiAnswer.filter((a) => a !== option.text),
                  });
                }
              }}
              size="lg"
              key={i}
            >
              <Box color="white">{Object.values(option)[0] || ""}</Box>
            </Checkbox>
          ))}
        </Stack>
      );
    default:
      return <></>;
  }
};

const AnswerForm = () => {
  const {
    formData,
    surveyId,
    isLoadingFormData: isLoading,
    isSubmitting,
    fetchFormData,
    submitAnswer,
  } = useAnswerForm();
  const { initLitCeramic } = useLitCeramic();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useControllableState({
    defaultValue: 0,
  });
  const [answers, setAnswers] = useState<
    Record<string, { question_type: string; answer: string | string[] }>
  >({});

  useEffect(() => {
    initLitCeramic();
  }, [initLitCeramic]);

  useEffect(() => {
    fetchFormData();
  }, [fetchFormData]);

  const question = formData
    ? formData["questions"].filter((q, i) => i === currentQuestionIndex)[0] ||
      null
    : null;

  const canSubmit = Object.keys(answers).length === formData?.questions.length;

  const onSubmit = async () => {
    if (!canSubmit) return;

    const answerArr = Object.entries(answers).map(([question_id, params]) => ({
      question_id,
      ...params,
    }));

    const { success } = await submitAnswer({
      submissionStrToEncrypt: JSON.stringify({ answers: answerArr }),
    });

    if (success)
      window.location.href = `${location.origin}/result?id=${surveyId}`;
  };

  if (!formData || !question || isLoading) {
    return (
      <Flex w="100%" h="500px" align="center" justify="center">
        <Spinner size="lg" color='white' />
      </Flex>
    );
  }

  return (
    <Container>
      <Box mt={8}>
        <Center>
          <Heading as="h2" color="white" size="sm" fontWeight="bold">
            {formData ? formData.title : "-"}
          </Heading>
        </Center>
      </Box>
      <Box w={"full"} mt={24}>
        <FormControl>
          <Box>
            <Box>
              <FormLabel color="white" size="xl">
                <Heading as="h3" color="white" size="lg" fontWeight="light">
                  {`${currentQuestionIndex + 1}. ${question.question_body}`}
                </Heading>
              </FormLabel>
              <FormInput
                question={question}
                answer={answers[question.id]}
                setAnswer={(a) => setAnswers({ ...answers, [question.id]: a })}
              />
              <Center mt={8}>
                {currentQuestionIndex < formData.questions.length - 1 && (
                  <Flex>
                    <Button
                      size="lg"
                      mr={8}
                      variant="text"
                      color="white"
                      disabled={currentQuestionIndex === 0}
                      onClick={() =>
                        setCurrentQuestionIndex(currentQuestionIndex - 1)
                      }
                    >
                      Back
                    </Button>
                    <Button
                      size="lg"
                      ml={8}
                      variant="outline"
                      color="white"
                      onClick={() =>
                        setCurrentQuestionIndex(currentQuestionIndex + 1)
                      }
                    >
                      Next
                    </Button>
                  </Flex>
                )}
                {currentQuestionIndex >= formData.questions.length - 1 && (
                  <Button
                    size="lg"
                    variant="outline"
                    color="white"
                    onClick={onSubmit}
                    disabled={!canSubmit || isSubmitting}
                    isLoading={isSubmitting}
                  >
                    Submit
                  </Button>
                )}
              </Center>
            </Box>
          </Box>
        </FormControl>
      </Box>
    </Container>
  );
};

export default AnswerForm;
