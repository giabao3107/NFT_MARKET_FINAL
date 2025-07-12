import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  Card,
  CardBody,
  Button,
  Divider,
  useColorModeValue,
  Link
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import {
  FiHelpCircle,
  FiMail,
  FiFileText,
  FiShield,
  FiMessageCircle,
  FiBook
} from 'react-icons/fi';

const Help = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const helpSections = [
    {
      title: 'Câu hỏi thường gặp',
      description: 'Tìm câu trả lời cho những câu hỏi phổ biến nhất',
      icon: FiHelpCircle,
      link: '/help/faq',
      color: 'blue'
    },
    {
      title: 'Liên hệ hỗ trợ',
      description: 'Liên hệ trực tiếp với đội ngũ hỗ trợ của chúng tôi',
      icon: FiMail,
      link: '/help/contact',
      color: 'green'
    },
    {
      title: 'Hướng dẫn sử dụng',
      description: 'Tài liệu chi tiết về cách sử dụng nền tảng',
      icon: FiBook,
      link: '/help/guide',
      color: 'purple'
    },
    {
      title: 'Điều khoản dịch vụ',
      description: 'Đọc các điều khoản và điều kiện sử dụng',
      icon: FiFileText,
      link: '/help/terms',
      color: 'orange'
    },
    {
      title: 'Chính sách bảo mật',
      description: 'Tìm hiểu cách chúng tôi bảo vệ thông tin của bạn',
      icon: FiShield,
      link: '/help/privacy',
      color: 'red'
    },
    {
      title: 'Cộng đồng',
      description: 'Tham gia cộng đồng và thảo luận với người dùng khác',
      icon: FiMessageCircle,
      link: '/community',
      color: 'teal'
    }
  ];

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading size="2xl" mb={4}>
            Trung tâm hỗ trợ
          </Heading>
          <Text fontSize="lg" color={textColor} maxW="2xl" mx="auto">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn. Tìm câu trả lời cho câu hỏi của bạn hoặc liên hệ với đội ngũ hỗ trợ.
          </Text>
        </Box>

        <Divider />

        {/* Help Sections */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {helpSections.map((section, index) => (
            <Card
              key={index}
              bg={bgColor}
              borderColor={borderColor}
              borderWidth={1}
              _hover={{
                transform: 'translateY(-4px)',
                shadow: 'lg',
                borderColor: `${section.color}.300`
              }}
              transition="all 0.2s"
              cursor="pointer"
              as={RouterLink}
              to={section.link}
            >
              <CardBody>
                <VStack align="start" spacing={4}>
                  <HStack>
                    <Icon
                      as={section.icon}
                      boxSize={6}
                      color={`${section.color}.500`}
                    />
                    <Heading size="md">{section.title}</Heading>
                  </HStack>
                  <Text color={textColor} fontSize="sm">
                    {section.description}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        <Divider />

        {/* Quick Actions */}
        <Box textAlign="center">
          <Heading size="lg" mb={4}>
            Cần hỗ trợ ngay?
          </Heading>
          <HStack justify="center" spacing={4} flexWrap="wrap">
            <Button
              as={RouterLink}
              to="/help/contact"
              colorScheme="blue"
              size="lg"
              leftIcon={<Icon as={FiMail} />}
            >
              Liên hệ hỗ trợ
            </Button>
            <Button
              as={RouterLink}
              to="/help/faq"
              variant="outline"
              size="lg"
              leftIcon={<Icon as={FiHelpCircle} />}
            >
              Xem FAQ
            </Button>
          </HStack>
        </Box>

        {/* Contact Info */}
        <Box
          bg={useColorModeValue('gray.50', 'gray.700')}
          p={6}
          borderRadius="lg"
          textAlign="center"
        >
          <Text fontSize="sm" color={textColor}>
            Bạn cũng có thể liên hệ với chúng tôi qua email:{' '}
            <Link
              href="mailto:support@nftmarketplace.com"
              color="blue.500"
              fontWeight="medium"
            >
              support@nftmarketplace.com
            </Link>
          </Text>
        </Box>
      </VStack>
    </Container>
  );
};

export default Help;