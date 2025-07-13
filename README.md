# NFT Marketplace

Một sàn giao dịch NFT phi tập trung hoàn chỉnh được xây dựng với React, Solidity và Hardhat. Nền tảng này cho phép người dùng tạo (mint), mua, bán và giao dịch NFT với hỗ trợ phí bản quyền tích hợp.

## Tổng quan

NFT Marketplace là một ứng dụng Web3 đầy đủ tính năng cho phép:
- Tạo và giao dịch NFT trên blockchain Ethereum
- Tích hợp ví MetaMask để thực hiện giao dịch
- Lưu trữ metadata trên IPFS để đảm bảo tính phi tập trung
- Hỗ trợ phí bản quyền cho người sáng tạo
- Giao diện người dùng hiện đại và responsive

## Tính năng chính

### Smart Contracts (Hợp đồng thông minh)
- **NFTCollection**: Hợp đồng ERC721 với hỗ trợ phí bản quyền (EIP-2981)
- **NFTMarketplace**: Hợp đồng sàn giao dịch để mua/bán NFT
- Phân phối phí bản quyền tự động cho người sáng tạo
- Quản lý phí sàn giao dịch
- Các chức năng khẩn cấp để quản lý hợp đồng
- Bảo mật cao với các kiểm tra reentrancy

### Frontend (Giao diện người dùng)
- **Ứng dụng React hiện đại** với Chakra UI
- **Tích hợp ví** với MetaMask và WalletConnect
- **Tích hợp IPFS** để lưu trữ metadata
- **Thiết kế responsive** cho mobile và desktop
- **Cập nhật real-time** với React Query
- **Hỗ trợ Dark/Light Mode**
- **Tối ưu hóa SEO** và performance

### Chức năng chính
- **Tạo NFT**: Mint NFT với metadata tùy chỉnh và thiết lập phí bản quyền
- **Giao dịch NFT**: Đăng bán, mua NFT với phân phối phí bản quyền tự động
- **Duyệt sàn giao dịch**: Tìm kiếm, lọc và sắp xếp NFT theo nhiều tiêu chí
- **Quản lý bộ sưu tập**: Xem và quản lý NFT cá nhân
- **Lịch sử giao dịch**: Theo dõi tất cả các giao dịch đã thực hiện
- **Hồ sơ người dùng**: Quản lý thông tin và bộ sưu tập cá nhân
- **Thống kê**: Xem thống kê giá, volume giao dịch

## Project Structure

```
NFT_MARKET/
├── contracts/                 # Smart contracts and deployment
│   ├── contracts/
│   │   ├── NFTCollection.sol
│   │   └── NFTMarketplace.sol
│   ├── scripts/
│   │   └── deploy.js
│   ├── test/
│   │   └── NFTMarketplace.test.js
│   ├── hardhat.config.js
│   └── package.json
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── contracts/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── .env
└── README.md
```

## Yêu cầu hệ thống

- **Node.js** (phiên bản 16 trở lên) - [Tải về](https://nodejs.org/)
- **npm** hoặc **yarn** - Package manager
- **MetaMask** browser extension - [Cài đặt](https://metamask.io/)
- **Git** - Version control
- **Trình duyệt hiện đại** hỗ trợ Web3 (Chrome, Firefox, Edge)
- **Kết nối internet ổn định** để tương tác với blockchain

## Cài đặt

### 1. Clone Repository

```bash
git clone <repository-url>
cd NFT_MARKET
```

### 2. Cài đặt Dependencies cho Smart Contracts

```bash
cd contracts
npm install
```

**Các package chính được cài đặt:**
- `@openzeppelin/contracts`: Thư viện smart contract chuẩn
- `hardhat`: Framework phát triển Ethereum
- `@nomiclabs/hardhat-ethers`: Plugin tích hợp Ethers.js
- `@nomiclabs/hardhat-waffle`: Framework testing

### 3. Cài đặt Dependencies cho Frontend

```bash
cd ../frontend
npm install
```

**Các package chính được cài đặt:**
- `react`: Framework UI
- `@chakra-ui/react`: Component library
- `ethers`: Thư viện tương tác blockchain
- `@tanstack/react-query`: State management cho API calls
- `axios`: HTTP client cho IPFS

## Configuration

Create a `.env` file in the `NFT_MARKET` directory:

```bash
cp .env.example .env
Edit the `.env` file with your configuration:
```

## Hướng dẫn chạy dự án

### Bước 1: Khởi động Local Blockchain

```bash
cd contracts
npx hardhat node
```

**Lệnh này sẽ:**
- Khởi động mạng Hardhat local trên `http://localhost:8545`
- Tạo 20 tài khoản test với 10,000 ETH mỗi tài khoản
- Hiển thị private keys để import vào MetaMask

**⚠️ Lưu ý:** Giữ terminal này mở trong suốt quá trình phát triển.

### Bước 2: Deploy Smart Contracts

Mở terminal mới và chạy:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

**Quá trình deploy sẽ:**
- Deploy contract NFTCollection với cấu hình royalty
- Deploy contract NFTMarketplace với marketplace fee
- Lưu địa chỉ contracts và ABIs vào file JSON
- Tự động cập nhật cấu hình frontend
- Hiển thị địa chỉ contracts đã deploy

### Bước 3: Khởi động Frontend Development Server

```bash
cd frontend
npm start
```

**Frontend sẽ:**
- Chạy trên `http://localhost:3000`
- Tự động reload khi có thay đổi code
- Kết nối với contracts đã deploy

### Bước 4: Cấu hình MetaMask

#### 4.1 Thêm mạng Local
1. Mở MetaMask extension
2. Click vào dropdown network (thường hiển thị "Ethereum Mainnet")
3. Click "Add Network" → "Add a network manually"
4. Nhập thông tin:
   - **Network Name**: `Hardhat Local`
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
   - **Block Explorer URL**: (để trống)

#### 4.2 Import tài khoản test
1. Copy một private key từ output của `hardhat node`
2. Trong MetaMask: Account menu → "Import Account"
3. Paste private key và click "Import"
4. Tài khoản sẽ có 10,000 ETH để test

### Bước 5: Kiểm tra kết nối

1. Truy cập `http://localhost:3000`
2. Click "Connect Wallet" 
3. Chọn MetaMask và authorize kết nối
4. Kiểm tra balance ETH hiển thị đúng
5. Thử tạo một NFT test để đảm bảo mọi thứ hoạt động

## Lệnh hữu ích

## Deployment

### Deploy to Sepolia Testnet

**📋 Hướng dẫn chi tiết: Xem file `SEPOLIA_SETUP.md`**

#### Tóm tắt nhanh:

1. **Chuẩn bị ví và ETH**:
   - Tạo ví MetaMask mới cho testnet
   - Thêm Sepolia network (Chain ID: 11155111)
   - Lấy Sepolia ETH từ faucet: https://sepoliafaucet.com/

2. **Cấu hình Private Key**:
   ```bash
   # Cập nhật trong file .env
   PRIVATE_KEY=your_sepolia_private_key_here
   ```

3. **Kiểm tra cấu hình**:
   ```bash
   cd contracts
   npx hardhat run scripts/check-sepolia.js --network sepolia
   ```

4. **Deploy contracts**:
   ```bash
   cd contracts
   npx hardhat run scripts/deploy.js --network sepolia
   ```

5. **Chuyển đổi network nhanh**:
   ```bash
   # Chuyển sang Sepolia
   node switch-network.js sepolia
   
   # Chuyển về Local
   node switch-network.js local
   
   # Kiểm tra network hiện tại
   node switch-network.js status
   ```

**⚠️ Lưu ý**: Dự án đã được cấu hình sẵn cho Sepolia. Chỉ cần cập nhật PRIVATE_KEY và có Sepolia ETH là có thể deploy ngay.

### Deploy Frontend

1. Build the frontend:

```bash
cd frontend
npm run build
```

2. Deploy to your preferred hosting service (Vercel, Netlify, etc.)

## Usage

### For Users

1. **Connect Wallet**: Click "Connect Wallet" to connect your MetaMask
2. **Browse NFTs**: Visit the Marketplace to browse available NFTs
3. **Buy NFTs**: Click on any NFT and use the "Buy Now" button
4. **Create NFTs**: Go to "Create" page to mint new NFTs
5. **Manage Collection**: Visit your Profile to manage your NFTs

### For Developers

#### Adding New Features

1. **Smart Contracts**: Add new functions to contracts in `contracts/contracts/`
2. **Frontend Components**: Add new React components in `frontend/src/components/`
3. **Pages**: Add new pages in `frontend/src/pages/`
4. **Context**: Extend existing contexts or create new ones in `frontend/src/contexts/`

#### Contract Interaction

```javascript
import { useNFT } from '../contexts/NFTContext';

function MyComponent() {
  const { mintNFT, listNFT, buyNFT } = useNFT();
  
  // Mint a new NFT
  const handleMint = async () => {
    await mintNFT({
      name: 'My NFT',
      description: 'Description',
      image: imageFile,
      royalty: 500 // 5%
    });
  };
}
```

## API Reference

### Smart Contract Functions

#### NFTCollection
- `mint(to, tokenURI, royaltyBasisPoints)`: Mint a new NFT
- `getTokensByOwner(owner)`: Get all tokens owned by an address
- `getTokensByCreator(creator)`: Get all tokens created by an address
- `royaltyInfo(tokenId, salePrice)`: Get royalty information

#### NFTMarketplace
- `listNFT(tokenId, price)`: List an NFT for sale
- `buyNFT(tokenId)`: Buy a listed NFT
- `delistNFT(tokenId)`: Remove NFT from marketplace
- `getActiveListings()`: Get all active listings

### Frontend Contexts

#### Web3Context
- `connectWallet()`: Connect MetaMask wallet
- `disconnectWallet()`: Disconnect wallet
- `switchNetwork(chainId)`: Switch to different network

#### NFTContext
- `mintNFT(metadata)`: Mint a new NFT
- `listNFT(tokenId, price)`: List NFT for sale
- `buyNFT(tokenId)`: Purchase an NFT
- `fetchUserNFTs()`: Get user's NFTs

## Xử lý sự cố

### Các lỗi thường gặp

#### 1. Lỗi kết nối MetaMask
**Triệu chứng:** Không thể kết nối ví hoặc hiển thị "Connect Wallet"

**Giải pháp:**
- Đảm bảo MetaMask đã được cài đặt và mở khóa
- Kiểm tra đang ở đúng network (Hardhat Local - Chain ID: 31337)
- Refresh trang web và thử lại
- Kiểm tra popup blocker có chặn MetaMask không
- Thử disconnect và connect lại trong MetaMask

#### 2. Lỗi giao dịch thất bại
**Triệu chứng:** Transaction bị reject hoặc fail

**Giải pháp:**
- Kiểm tra balance ETH đủ để trả gas fee
- Đảm bảo địa chỉ contracts đúng (kiểm tra trong console)
- Verify cấu hình network trong MetaMask
- Thử tăng gas limit nếu cần
- Kiểm tra contract có được deploy đúng không

#### 3. Lỗi upload IPFS
**Triệu chứng:** Không thể upload hình ảnh hoặc metadata

**Giải pháp:**
- Kiểm tra API credentials của Pinata trong file .env
- Đảm bảo file size không vượt quá giới hạn (10MB)
- Kiểm tra kết nối internet
- Thử upload file khác để test
- Kiểm tra format file có được hỗ trợ không

#### 4. Lỗi "Contract not deployed"
**Triệu chứng:** Frontend không thể tương tác với contracts

**Giải pháp:**
- Đảm bảo đã chạy `npx hardhat node`
- Redeploy contracts: `npx hardhat run scripts/deploy.js --network localhost`
- Kiểm tra file contract addresses trong frontend/src/contracts/
- Restart frontend server

#### 5. Lỗi "Network mismatch"
**Triệu chứng:** MetaMask báo sai network

**Giải pháp:**
- Switch sang Hardhat Local network trong MetaMask
- Nếu không có network này, thêm lại theo hướng dẫn
- Kiểm tra Chain ID phải là 31337
- Restart MetaMask nếu cần

### Debug và kiểm tra

#### Kiểm tra console logs
```javascript
// Mở Developer Tools (F12) và kiểm tra:
// 1. Console tab - xem error messages
// 2. Network tab - kiểm tra API calls
// 3. Application tab - kiểm tra localStorage
```

#### Kiểm tra contract events
```bash
# Xem logs của hardhat node để debug transactions
cd contracts
npx hardhat console --network localhost
```

#### Kiểm tra environment variables
```bash
# Đảm bảo các file .env được cấu hình đúng
cat contracts/.env
cat frontend/.env
```

### Liên hệ hỗ trợ

- Kiểm tra browser console để xem error messages chi tiết
- Review smart contract events trong transaction receipt
- Đảm bảo tất cả environment variables được set đúng
- Kiểm tra version của Node.js và npm
- Thử clear cache browser và restart development servers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenZeppelin for smart contract libraries
- Hardhat for development framework
- Chakra UI for React components
- Ethers.js for blockchain interaction
- IPFS for decentralized storage