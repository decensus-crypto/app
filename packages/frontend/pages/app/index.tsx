import FormList from "../../components/FormList";

import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Grid,
  GridItem,
  Heading,
  Spacer,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import FormCreationModal from "../../components/FormCreationModal";
import Layout from "../../layouts/default";

const AppRoot = () => {
  // modal control
  const { isOpen, onOpen, onClose } = useDisclosure();
  // key of the modal component. By changing this key, force the modal component to be refreshed.
  const [modalKey, setModalKey] = useState(0);

  return (
    <>
      <Layout>
        <Box w={"full"} mb={32}>
          <Flex>
            <Heading as="h2" size="md" fontWeight="light" color="white">
              My Forms
            </Heading>
            <Spacer />
            <Button
              size="sm"
              variant="outline"
              color="#FC8CC9"
              onClick={onOpen}
            >
              Create New Form
            </Button>
          </Flex>
          <Grid mt={8} templateColumns="repeat(12, 1fr)" gap={4}>
            <GridItem colSpan={{ base: 12, md: 4 }}>
              <Flex>
                <Spacer />
                <ButtonGroup isAttached variant="outline"></ButtonGroup>
              </Flex>
            </GridItem>
          </Grid>

          <FormList />
        </Box>
      </Layout>

      <FormCreationModal
        key={modalKey}
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={() => {
          onClose();
          setModalKey(modalKey + 1);
        }}
      />
    </>
  );
};

export default AppRoot;
