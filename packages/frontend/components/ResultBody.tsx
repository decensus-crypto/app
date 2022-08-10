import {
  Badge,
  Box,
  Container,
  Divider,
  Flex,
  Heading,
  Image,
  Spacer,
  Spinner,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Text,
} from "@chakra-ui/react";
import Highcharts from "highcharts";
import Highcharts3d from "highcharts/highcharts-3d";
import HighchartsExporting from "highcharts/modules/exporting";
import { useCallback, useEffect, useMemo, useState } from "react";

import { COUNTRY_QUESTION } from "../constants/constants";
import { useFormData } from "../hooks/useFormData";
import { useLitCeramic } from "../hooks/useLitCeramic";
import { useResult } from "../hooks/useResult";
import {
  fetchNftAggregationStats,
  fetchNftBaseInfo,
  fetchSampleToken,
} from "../utils/zdk";

const NftSummary = () => {
  const [nftData, setNftData] = useState<{
    name: string;
    address: string;
    imageUrl: string;
    totalSupply: number;
    ownerCount: number;
    floorPrice: number | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { nftAddress } = useResult();

  const getNft = useCallback(async () => {
    if (!nftAddress) return;

    try {
      setIsLoading(true);

      const [stats, baseInfo, tokens] = await Promise.all([
        fetchNftAggregationStats(nftAddress),
        fetchNftBaseInfo(nftAddress),
        fetchSampleToken(nftAddress),
      ]);

      setNftData({
        address: baseInfo.address || "",
        name: baseInfo.name || "",
        imageUrl: tokens?.tokens?.nodes[0]?.token?.image?.url || "",
        totalSupply: baseInfo.totalSupply || 0,
        ownerCount: stats.aggregateStat.ownerCount || 0,
        floorPrice: stats.aggregateStat.floorPrice || null,
      });
    } finally {
      setIsLoading(false);
    }
  }, [nftAddress]);

  useEffect(() => {
    if (nftData || isLoading) return;
    getNft();
  }, [nftData, isLoading, getNft]);

  return (
    <Flex
      p={4}
      boxShadow={"lg"}
      rounded={"lg"}
      background={"gray.800"}
      justify="stretch"
    >
      <Box w={16} h={16} mr={2} my={3}>
        {nftData?.imageUrl && (
          <Image rounded="50%" alt="nft icon" src={nftData?.imageUrl} />
        )}
      </Box>
      <Box w="100%">
        <Flex px={4} py={4} align="center">
          <Heading as="h3" size="md" fontWeight="bold" color="white">
            {isLoading ? <Spinner /> : nftData?.name}
          </Heading>
          <Spacer />
          <Badge
            as="div"
            display="flex"
            alignItems="center"
            justifyContent="center"
            colorScheme="green"
          >
            {nftData?.address.substring(0, 12) + "..."}
          </Badge>
        </Flex>
        <Divider />
        <Box px={4} py={4}>
          <StatGroup>
            <Stat>
              <StatLabel color="white">Items</StatLabel>
              <StatNumber color="white">
                {isLoading ? <Spinner /> : nftData?.totalSupply}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel color="white">Owners</StatLabel>
              <StatNumber color="white">
                {isLoading ? <Spinner /> : nftData?.ownerCount}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel color="white">Floor Price</StatLabel>
              <StatNumber color="white">
                {isLoading ? (
                  <Spinner />
                ) : nftData?.floorPrice == null ? (
                  "-"
                ) : (
                  nftData?.floorPrice
                )}
              </StatNumber>
            </Stat>
          </StatGroup>
        </Box>
      </Box>
    </Flex>
  );
};

const chartContainerName = (title: string) => `${title}ChartContainer`;

const buildBarChart = (params: { data: [string, number][]; title: string }) => {
  Highcharts.chart(chartContainerName(params.title), {
    chart: {
      style: {
        color: "#ffffff",
      },
      type: "bar",
      marginRight: 30,
      backgroundColor: "#000000",
    },
    title: {
      text: params.title,
      style: {
        color: "#ffffff",
      },
    },
    xAxis: {
      type: "category",
      title: {
        text: null,
        style: {
          color: "#ffffff",
        },
      },
      labels: {
        style: {
          color: "#ffffff",
        },
      },
    },
    yAxis: {
      lineWidth: 1,
      title: {
        text: "Votes",
        align: "high",
        style: {
          color: "#ffffff",
        },
      },
      showLastLabel: false,
      labels: {
        style: {
          color: "#ffffff",
        },
      },
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true,
        },
      },
    },
    legend: { enabled: false },
    credits: { enabled: false },
    series: [
      {
        name: "Votes",
        data: params.data,
      },
    ],
  } as any);
};

const buildPieChart = (params: { data: [string, number][]; title: string }) => {
  Highcharts.chart(chartContainerName(params.title), {
    chart: {
      type: "pie",
      options3d: {
        enabled: true,
        alpha: 45,
        beta: 0,
      },
      backgroundColor: "#000000",
    },
    title: {
      text: params.title,
      style: {
        color: "#ffffff",
      },
    },
    accessibility: {
      point: {
        valueSuffix: "%",
      },
    },
    tooltip: {
      pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>",
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        depth: 35,
        dataLabels: {
          enabled: true,
          format: "{point.name}",
          style: {
            color: "#ffffff",
          },
        },
      },
    },
    series: [
      {
        type: "pie",
        data: params.data,
      },
    ],
  });
};

const ResultBody = () => {
  const { initLitCeramic } = useLitCeramic();
  const { formData, isLoadingFormData, fetchFormData } = useFormData();
  const { isLoadingAnswersList, answersList, fetchResults, fetchNftAddress } =
    useResult();

  useEffect(() => {
    initLitCeramic();
  }, [initLitCeramic]);

  useEffect(() => {
    fetchFormData();
  }, [fetchFormData]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  useEffect(() => {
    fetchNftAddress();
  }, [fetchNftAddress]);

  const questions = formData?.questions;

  const aggData = useMemo(() => {
    if (!answersList || !questions) return [];

    return questions.map((question) => {
      const options = [...question.options];

      const answers = answersList
        .flatMap((d) => d.answers)
        .filter((a) => a.question_id === question.id);

      const aggObj = options.reduce((p, c) => {
        p[c.text] = 0;
        return p;
      }, {} as Record<string, number>);

      for (const a of answers) {
        const text = a.answer.toString();
        if (aggObj[text] == null) continue;

        aggObj[text] += 1;
      }

      return {
        id: question.id,
        title: question.question_title,
        data: options.map((o) => [o.text, aggObj[o.text]]) as [
          string,
          number
        ][],
      };
    });
  }, [answersList, questions]);

  useEffect(() => {
    Highcharts3d(Highcharts);
    HighchartsExporting(Highcharts);
  }, []);

  useEffect(() => {
    aggData.forEach((data) => {
      if (data.id !== COUNTRY_QUESTION.id) {
        buildBarChart({ title: data.title, data: data.data });
      } else {
        const _data = data.data
          .filter((r) => r[1] > 0)
          .sort((r1, r2) => r2[1] - r1[1]);
        buildPieChart({
          title: data.title,
          data: _data,
        });
      }
    });
  }, [aggData]);

  if (isLoadingAnswersList)
    return (
      <Flex w="100%" h="500px" align="center" justify="center">
        <Spinner size="lg" color="white" />
      </Flex>
    );

  if (!isLoadingAnswersList && answersList && answersList.length === 0) {
    return (
      <Flex w="100%" h="500px" align="center" justify="center">
        <Text fontSize="xl" color="white">
          No results to show
        </Text>
      </Flex>
    );
  }

  return (
    <Box w={"full"} mb={32}>
      <Container maxWidth={"2xl"} mt={8}>
        <NftSummary />
      </Container>
      {aggData.map((d) => (
        <Container key={d.id} maxWidth={"2xl"} mt={8}>
          <Box boxShadow={"lg"} rounded={"lg"}>
            <figure className="highcharts-figure">
              <div id={chartContainerName(d.title)}></div>
            </figure>
          </Box>
        </Container>
      ))}
    </Box>
  );
};

export default ResultBody;
