import React, { useState } from 'react';
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
  Switch,
  Button,
  Divider,
  useColorModeValue,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Avatar,
  Badge
} from '@chakra-ui/react';
import {
  FiUser,
  FiBell,
  FiShield,
  FiGlobe,
  FiMoon,
  FiSun,
  FiSave,
  FiEdit3
} from 'react-icons/fi';
import { useWeb3 } from '../../contexts/Web3Context';

const Settings = () => {
  const { account, isConnected } = useWeb3();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const [settings, setSettings] = useState({
    // Profile Settings
    displayName: '',
    bio: '',
    email: '',
    website: '',
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    priceAlerts: true,
    
    // Privacy Settings
    profileVisibility: 'public',
    showEmail: false,
    showActivity: true,
    
    // Display Settings
    darkMode: false,
    language: 'vi',
    currency: 'ETH'
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Simulate saving settings
    toast({
      title: 'Cài đặt đã được lưu',
      description: 'Các thay đổi của bạn đã được cập nhật thành công.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  if (!isConnected) {
    return (
      <Container maxW="7xl" py={8}>
        <Box textAlign="center">
          <Heading size="lg" mb={4}>
            Vui lòng kết nối ví
          </Heading>
          <Text color={textColor}>
            Bạn cần kết nối ví để truy cập trang cài đặt.
          </Text>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="2xl" mb={2}>
            Cài đặt tài khoản
          </Heading>
          <Text color={textColor}>
            Quản lý thông tin cá nhân và tùy chọn của bạn
          </Text>
        </Box>

        <Divider />

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          {/* Profile Settings */}
          <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
            <CardBody>
              <VStack align="stretch" spacing={6}>
                <HStack>
                  <Icon as={FiUser} boxSize={5} color="blue.500" />
                  <Heading size="md">Thông tin cá nhân</Heading>
                </HStack>

                <HStack spacing={4}>
                  <Avatar size="lg" name={account} />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium">{account}</Text>
                    <Badge colorScheme="green">Đã xác thực</Badge>
                  </VStack>
                </HStack>

                <FormControl>
                  <FormLabel>Tên hiển thị</FormLabel>
                  <Input
                    value={settings.displayName}
                    onChange={(e) => handleSettingChange('displayName', e.target.value)}
                    placeholder="Nhập tên hiển thị"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Giới thiệu</FormLabel>
                  <Textarea
                    value={settings.bio}
                    onChange={(e) => handleSettingChange('bio', e.target.value)}
                    placeholder="Viết vài dòng về bản thân..."
                    rows={3}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleSettingChange('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Website</FormLabel>
                  <Input
                    value={settings.website}
                    onChange={(e) => handleSettingChange('website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </FormControl>
              </VStack>
            </CardBody>
          </Card>

          {/* Notification Settings */}
          <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
            <CardBody>
              <VStack align="stretch" spacing={6}>
                <HStack>
                  <Icon as={FiBell} boxSize={5} color="green.500" />
                  <Heading size="md">Thông báo</Heading>
                </HStack>

                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">Thông báo email</Text>
                      <Text fontSize="sm" color={textColor}>
                        Nhận thông báo qua email
                      </Text>
                    </VStack>
                    <Switch
                      isChecked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    />
                  </HStack>

                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">Thông báo đẩy</Text>
                      <Text fontSize="sm" color={textColor}>
                        Nhận thông báo trên trình duyệt
                      </Text>
                    </VStack>
                    <Switch
                      isChecked={settings.pushNotifications}
                      onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                    />
                  </HStack>

                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">Email marketing</Text>
                      <Text fontSize="sm" color={textColor}>
                        Nhận tin tức và ưu đãi
                      </Text>
                    </VStack>
                    <Switch
                      isChecked={settings.marketingEmails}
                      onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
                    />
                  </HStack>

                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">Cảnh báo giá</Text>
                      <Text fontSize="sm" color={textColor}>
                        Thông báo khi giá thay đổi
                      </Text>
                    </VStack>
                    <Switch
                      isChecked={settings.priceAlerts}
                      onChange={(e) => handleSettingChange('priceAlerts', e.target.checked)}
                    />
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Privacy Settings */}
          <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
            <CardBody>
              <VStack align="stretch" spacing={6}>
                <HStack>
                  <Icon as={FiShield} boxSize={5} color="red.500" />
                  <Heading size="md">Quyền riêng tư</Heading>
                </HStack>

                <FormControl>
                  <FormLabel>Hiển thị hồ sơ</FormLabel>
                  <Select
                    value={settings.profileVisibility}
                    onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                  >
                    <option value="public">Công khai</option>
                    <option value="private">Riêng tư</option>
                    <option value="friends">Chỉ bạn bè</option>
                  </Select>
                </FormControl>

                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium">Hiển thị email</Text>
                    <Text fontSize="sm" color={textColor}>
                      Cho phép người khác xem email
                    </Text>
                  </VStack>
                  <Switch
                    isChecked={settings.showEmail}
                    onChange={(e) => handleSettingChange('showEmail', e.target.checked)}
                  />
                </HStack>

                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium">Hiển thị hoạt động</Text>
                    <Text fontSize="sm" color={textColor}>
                      Cho phép người khác xem hoạt động
                    </Text>
                  </VStack>
                  <Switch
                    isChecked={settings.showActivity}
                    onChange={(e) => handleSettingChange('showActivity', e.target.checked)}
                  />
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Display Settings */}
          <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
            <CardBody>
              <VStack align="stretch" spacing={6}>
                <HStack>
                  <Icon as={FiGlobe} boxSize={5} color="purple.500" />
                  <Heading size="md">Hiển thị</Heading>
                </HStack>

                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium">Chế độ tối</Text>
                    <Text fontSize="sm" color={textColor}>
                      Sử dụng giao diện tối
                    </Text>
                  </VStack>
                  <HStack>
                    <Icon as={FiSun} color={settings.darkMode ? 'gray.400' : 'yellow.500'} />
                    <Switch
                      isChecked={settings.darkMode}
                      onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                    />
                    <Icon as={FiMoon} color={settings.darkMode ? 'blue.500' : 'gray.400'} />
                  </HStack>
                </HStack>

                <FormControl>
                  <FormLabel>Ngôn ngữ</FormLabel>
                  <Select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                    <option value="zh">中文</option>
                    <option value="ja">日本語</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Đơn vị tiền tệ</FormLabel>
                  <Select
                    value={settings.currency}
                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                  >
                    <option value="ETH">ETH</option>
                    <option value="USD">USD</option>
                    <option value="VND">VND</option>
                    <option value="BTC">BTC</option>
                  </Select>
                </FormControl>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Save Button */}
        <Box textAlign="center">
          <Button
            colorScheme="blue"
            size="lg"
            leftIcon={<Icon as={FiSave} />}
            onClick={handleSave}
          >
            Lưu thay đổi
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default Settings;