import {
  AddIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  CopyIcon,
  EditIcon,
} from "@chakra-ui/icons";
import {
  Box,
  Button,
  Card,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Modal,
  ModalContent,
  ModalOverlay,
  Select,
  Spacer,
  Text,
  Textarea,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import Carousel from "nuka-carousel/lib/carousel";
import { useEffect, useMemo, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
  ResponderProvided,
} from "react-beautiful-dnd";
// @ts-expect-error
import { v4 as uuidv4 } from "uuid";
import { Question, QUESTIONS } from "../constants/constants";
import { useCeramic } from "../hooks/litCeramic/useCeramic";
import { useLit } from "../hooks/litCeramic/useLit";
import { useDeploy } from "../hooks/useDeploy";
import { useTokenHolders } from "../hooks/useTokenHolders";
import { fetchNftBaseInfo } from "../utils/zdk";
import Logo from "./logo";

const QuestionForm = (props: {
  idx: number;
  question: Question;
  onChanged: (question: Question, idx: number) => void;
}) => {
  const [questionType, setQuestionType] = useState(
    props.question.question_type
  );
  const [questionBody, setQuestionBody] = useState(
    props.question.question_body
  );
  const [options, setOptions] = useState(props.question.options);

  useEffect(() => {
    (async () => {
      props.onChanged(
        {
          id: props.question.id,
          question_type: questionType,
          question_body: questionBody,
          options: options,
        },
        props.idx
      );
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionType, questionBody, options]);

  const setOptionText = (val: string, idx: number) => {
    setOptions((options) => {
      const records = [...options];
      records[idx] = { text: val };
      return records;
    });
  };
  const addOption = () => {
    setOptions((options) => {
      return [...options, { text: "" }];
    });
  };
  const removeOption = (idx: number) => {
    setOptions((options) => {
      return options.filter((_, iidx) => idx !== iidx);
    });
  };
  return (
    <Flex>
      <Text fontSize="2xl" px={4} w={16} color="white">
        {props.idx + 1}
      </Text>
      <Box flex="1">
        <FormControl>
          <Textarea
            color="white"
            required
            size="lg"
            placeholder="What's your age range?"
            value={questionBody}
            onChange={(evt) => setQuestionBody(evt.target.value)}
          />
        </FormControl>
        <FormControl mt={4}>
          <FormLabel color="white">Answer Type</FormLabel>
          <Select
            w={240}
            color="white"
            required
            size="sm"
            value={questionType}
            onChange={(evt) =>
              setQuestionType(
                evt.target.value as
                  | "single_choice"
                  | "single_choice_dropdown"
                  | "multi_choice"
                  | "text"
              )
            }
          >
            <option value="single_choice">Choice</option>
            <option value="single_choice_dropdown">Dropdown</option>
            <option value="multi_choice">Checkbox</option>
            <option value="text">Text</option>
          </Select>
        </FormControl>
        {["single_choice", "single_choice_dropdown", "multi_choice"].some(
          (opt) => opt === questionType
        ) && (
          <FormControl mt={4}>
            <FormLabel color="white">Choices</FormLabel>
            <VStack align="start">
              {options.flatMap((option, iidx) => {
                return (
                  <Flex align="center">
                    <Input
                      flex={1}
                      required
                      color="white"
                      w={240}
                      value={option.text}
                      onChange={(evt) => setOptionText(evt.target.value, iidx)}
                    />
                    <IconButton
                      variant="ghost"
                      ml={2}
                      aria-label="Remove"
                      icon={<CloseIcon />}
                      onClick={() => removeOption(iidx)}
                    />
                  </Flex>
                );
              })}
            </VStack>
            <Button size="sm" leftIcon={<AddIcon />} mt={2} onClick={addOption}>
              Add
            </Button>
          </FormControl>
        )}
      </Box>
    </Flex>
  );
};

const QuestionRow = (props: {
  idx: number;
  question: Question;
  isActive: boolean;
  onQuestionChanged: (question: Question, idx: number) => void;
  onQuestionSelected: (idx: number) => void;
  onDuplicateQuestionClicked: (idx: number) => void;
  onRemoveQuestionClicked: (idx: number) => void;
}) => {
  return (
    <Flex
      py="4px"
      px="2px"
      w="320px"
      bg={props.isActive ? "gray.800" : "inherit"}
    >
      <Center>
        <Box w="32px" h="32px">
          <Text
            fontSize="md"
            textAlign="center"
            color="white"
            mt="4px"
            mr="4px"
          >
            {props.idx + 1}
          </Text>
        </Box>
        <Text fontSize="sm" w="192px" color="white" textOverflow="clip" px={1}>
          {props.question.question_body}
        </Text>
        <Box w="32px" h="32px">
          <Tooltip label="Duplicate">
            <IconButton
              mt="4px"
              mr="4px"
              size="xs"
              colorScheme="gray"
              aria-label="Duplicate"
              icon={<CopyIcon />}
              onClick={() => props.onDuplicateQuestionClicked(props.idx)}
            />
          </Tooltip>
        </Box>
        <Box w="32px" h="32px">
          <Tooltip label="Remeve">
            <IconButton
              size="xs"
              mt="4px"
              mr="4px"
              colorScheme="gray"
              aria-label="Remeve"
              icon={<CloseIcon />}
              onClick={() => props.onRemoveQuestionClicked(props.idx)}
            />
          </Tooltip>
        </Box>
        <Box w="32px" h="32px">
          <Tooltip label="Edit">
            <IconButton
              size="xs"
              mt="4px"
              mr="4px"
              aria-label="Edit"
              colorScheme="pink"
              icon={<EditIcon />}
              onClick={() => props.onQuestionSelected(props.idx)}
            />
          </Tooltip>
        </Box>
      </Center>
    </Flex>
  );
};

const NewFormQuestionsDialog = (props: {
  title: string;
  description: string;
  contractAddress: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onCreated: (formUrl: string) => void;
}) => {
  const { deploy, isDeploying } = useDeploy();
  const { initLitClient, isLitClientReady } = useLit();
  const { initCeramic } = useCeramic();
  const { tokenHolders, fetchHolders } = useTokenHolders();

  // form title and contract address
  const [isLoadingNftName, setIsLoadingNftName] = useState(false);
  const [loadedNftName, setLoadedNftName] = useState(false);

  // question IDs to include in form
  const [questions, setQuestions] = useState<Question[]>([...QUESTIONS]);
  const isSecondStepValid = questions.length > 0;
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  const prevSlidable = useMemo(() => {
    return 0 < activeQuestionIdx;
  }, [activeQuestionIdx]);
  const nextSlidable = useMemo(() => {
    return activeQuestionIdx < questions.length - 1;
  }, [activeQuestionIdx, questions]);

  useEffect(() => {
    initLitClient();
  }, [initLitClient]);

  useEffect(() => {
    initCeramic();
  }, [initCeramic]);

  useEffect(() => {
    (async () => {
      if (isLoadingNftName || loadedNftName) return;
      if (props.contractAddress.length === 0) return;

      try {
        setIsLoadingNftName(true);
        const [baseInfo] = await Promise.all([
          fetchNftBaseInfo(props.contractAddress),
          fetchHolders(props.contractAddress),
        ]);
        if (!baseInfo || !baseInfo.name) {
          return;
        }
      } catch (error: any) {
        console.error(error);
      } finally {
        setIsLoadingNftName(false);
        setLoadedNftName(true);
      }
    })();
  }, [fetchHolders, isLoadingNftName, loadedNftName, props.contractAddress]);

  const onDragEnd = (result: DropResult, provided: ResponderProvided) => {
    if (!result.destination) return;

    const reorderedQuestions = Array.from(questions);
    const [removed] = reorderedQuestions.splice(result.source.index, 1);
    reorderedQuestions.splice(result.destination.index, 0, removed);
    setQuestions(reorderedQuestions);
  };

  const onQuestionChanged = (question: Question, idx: number) => {
    const records = [...questions];
    records[idx].question_type = question.question_type;
    records[idx].question_body = question.question_body;
    records[idx].options = [...question.options];

    setQuestions(records);
  };

  const clickDuplicateQuestion = (idx: number) => {
    const currentQuestion = questions[idx];
    setQuestions((questions) => {
      const records = [...questions];
      records.push({
        id: uuidv4(),
        question_type: currentQuestion.question_type,
        question_body: currentQuestion.question_body,
        options: currentQuestion.options,
      });
      return records;
    });
  };
  const clickRemoveQuestion = (idx: number) => {
    setQuestions((questions) => {
      return [...questions].filter((_, iidx) => idx !== iidx);
    });
  };
  const clickAddQuestion = () => {
    setQuestions((questions) => {
      const records = [...questions];
      records.push({
        id: uuidv4(),
        question_type: "single_choice",
        question_body: "",
        options: [],
      });
      return records;
    });
  };
  const clickPrev = () => {
    if (!prevSlidable) return;
    setActiveQuestionIdx(activeQuestionIdx - 1);
  };
  const clickNext = () => {
    if (!nextSlidable) return;
    setActiveQuestionIdx(activeQuestionIdx + 1);
  };
  const onClickDeploy = () => {
    if (isDeploying) return;
    if (!isLitClientReady) return;
    if (!isSecondStepValid) return;
    onDeploy();
  };

  const onDeploy = async () => {
    const res = await deploy({
      formParams: {
        title: props.title,
        description: props.description,
        questions: questions,
      },
      formViewerAddresses: tokenHolders,
      nftAddress: props.contractAddress,
    });
    if (!res) {
      //
      // null response means form creation faile
      //
      return;
    }
    props.onCreated(res.formUrl);
  };

  return (
    <Modal size="full" isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent>
        <Box h="64px" w="100%" overflowY="hidden" bg="black">
          <Tooltip label={props.description}>
            <Box mt={3}>
              <Center>
                <Heading as="h2" size="md" color="white">
                  {props.title}
                </Heading>
              </Center>
              <Center>
                <Heading as="h4" size="xs" fontWeight="light" color="white">
                  {props.contractAddress}
                </Heading>
              </Center>
            </Box>
          </Tooltip>
          <Flex>
            <Logo height={12} position="absolute" top={2} left={3} />
            <Box height={12} position="absolute" top={4} right={3}>
              <Button
                size="sm"
                colorScheme="pink"
                onClick={onClickDeploy}
                isLoading={isDeploying}
                disabled={
                  isDeploying || !isLitClientReady || !isSecondStepValid
                }
              >
                Publish
              </Button>
              <IconButton
                ml={4}
                variant="ghost"
                size="sm"
                aria-label="Close"
                icon={<CloseIcon />}
                onClick={props.onClose}
              />
            </Box>
          </Flex>
        </Box>
        <Box h="1px" w="100%" bg="gray.700" />
        <Box h="calc(100vh - 64px - 1px)" w="100%" bg="black">
          <Flex>
            <Box h="calc(100vh - 64px - 1px)" w="320px">
              <Box h="calc(100vh - 64px - 1px - 64px)" overflowY="scroll">
                <Heading
                  as="h3"
                  size="sm"
                  fontWeight="light"
                  color="white"
                  p={2}
                >
                  Questions
                </Heading>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                      <Box {...provided.droppableProps} ref={provided.innerRef}>
                        {questions.map((question, idx) => (
                          <Draggable
                            key={question.id}
                            draggableId={"q-" + question.id}
                            index={idx}
                          >
                            {(provided, snapshot) => (
                              <Box
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                bg={
                                  snapshot.isDragging ? "ping.100" : "inherit"
                                }
                              >
                                <QuestionRow
                                  idx={idx}
                                  question={question}
                                  isActive={idx === activeQuestionIdx}
                                  onQuestionChanged={onQuestionChanged}
                                  onQuestionSelected={(idx) =>
                                    setActiveQuestionIdx(idx)
                                  }
                                  onDuplicateQuestionClicked={
                                    clickDuplicateQuestion
                                  }
                                  onRemoveQuestionClicked={clickRemoveQuestion}
                                />
                              </Box>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </DragDropContext>
              </Box>
              <Box p={4}>
                <Button
                  leftIcon={<AddIcon />}
                  size="sm"
                  w="100%"
                  colorScheme="gray"
                  onClick={clickAddQuestion}
                >
                  Add Question
                </Button>
              </Box>
            </Box>
            <Box h="calc(100vh - 64px - 1px)" w="1px" bg="gray.700"></Box>
            <Box
              h="calc(100vh - 64px - 1px)"
              w="calc(100vw - 280px - 1px)"
              overflowY="scroll"
            >
              <Box h="68px" w="100%">
                <Flex>
                  <Tooltip label="Previous">
                    <IconButton
                      m={4}
                      size="md"
                      aria-label="Previous"
                      icon={<ChevronLeftIcon />}
                      disabled={!prevSlidable}
                      onClick={clickPrev}
                    />
                  </Tooltip>
                  <Spacer />
                  <Tooltip label="Next">
                    <IconButton
                      m={4}
                      size="md"
                      aria-label="Next"
                      icon={<ChevronRightIcon />}
                      disabled={!nextSlidable}
                      onClick={clickNext}
                    />
                  </Tooltip>
                </Flex>
              </Box>
              <Box h="calc(100vh - 64px - 1px - 68px)" px={4} pb={16}>
                <Carousel
                  slidesToShow={1}
                  withoutControls={true}
                  dragging={false}
                  slideIndex={activeQuestionIdx}
                >
                  {questions.map((question, idx) => {
                    return (
                      <Card
                        key={`question_form_${question.id}`}
                        bg="gray.800"
                        w="100%"
                        h="100%"
                        overflowY="scroll"
                        p={16}
                      >
                        <QuestionForm
                          idx={activeQuestionIdx}
                          question={question}
                          onChanged={onQuestionChanged}
                        />
                      </Card>
                    );
                  })}
                </Carousel>
              </Box>
            </Box>
          </Flex>
        </Box>
      </ModalContent>
    </Modal>
  );
};

export default NewFormQuestionsDialog;
