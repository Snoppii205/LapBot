// Auto-generated from thanhtrungit97/dvhcvn (mapping_old_data/ward_mappings.sql)
// Bảng ánh xạ đầy đủ 63 Tỉnh/TP cũ -> Quận/Huyện cũ -> Phường/Xã cũ sang Mã Phường/Xã/Đặc khu mới 2026
// Lazy-loaded on demand via dynamic import() so initial bundle stays minimal.

export interface VnLegacyDistrictNode {
  oldDistrict: string;
  wards: Array<readonly [oldWard: string, newWardCode: string]>;
}

export interface VnLegacyProvinceNode {
  oldProvince: string;
  districts: VnLegacyDistrictNode[];
}

export const VN_LEGACY_WARD_TREE_2026: VnLegacyProvinceNode[] = [
  {
    oldProvince: 'Tỉnh An Giang',
    districts: [
      {
        oldDistrict: 'Huyện An Phú',
        wards: [
          ['Thị trấn An Phú', '30337'],
          ['Thị trấn Đa Phước', '30367'],
          ['Thị trấn Long Bình', '30341'],
          ['Xã Khánh An', '30341'],
          ['Xã Khánh Bình', '30341'],
          ['Xã Nhơn Hội', '30346'],
          ['Xã Phú Hội', '30337'],
          ['Xã Phú Hữu', '30352'],
          ['Xã Phước Hưng', '30337'],
          ['Xã Quốc Thái', '30346'],
          ['Xã Vĩnh Hậu', '30367'],
          ['Xã Vĩnh Hội Đông', '30337'],
          ['Xã Vĩnh Lộc', '30352'],
          ['Xã Vĩnh Trường', '30367']
        ]
      },
      {
        oldDistrict: 'Huyện Châu Phú',
        wards: [
          ['Thị trấn Cái Dầu', '30463'],
          ['Thị trấn Vĩnh Thạnh Trung', '30478'],
          ['Xã Bình Chánh', '30487'],
          ['Xã Bình Long', '30463'],
          ['Xã Bình Mỹ', '30487'],
          ['Xã Bình Phú', '30463'],
          ['Xã Bình Thủy', '30487'],
          ['Xã Đào Hữu Cảnh', '30481'],
          ['Xã Khánh Hòa', '30469'],
          ['Xã Mỹ Đức', '30469'],
          ['Xã Mỹ Phú', '30478'],
          ['Xã Ô Long Vỹ', '30481'],
          ['Xã Thạnh Mỹ Tây', '30481']
        ]
      },
      {
        oldDistrict: 'Huyện Châu Thành',
        wards: [
          ['Thị trấn An Châu', '30589'],
          ['Thị trấn Vĩnh Bình', '30604'],
          ['Xã An Hòa', '30607'],
          ['Xã Bình Hòa', '30607'],
          ['Xã Bình Thạnh', '30607'],
          ['Xã Cần Đăng', '30595'],
          ['Xã Hòa Bình Thạnh', '30589'],
          ['Xã Tân Phú', '30604'],
          ['Xã Vĩnh An', '30604'],
          ['Xã Vĩnh Hanh', '30619'],
          ['Xã Vĩnh Lợi', '30595'],
          ['Xã Vĩnh Nhuận', '30619'],
          ['Xã Vĩnh Thành', '30589']
        ]
      },
      {
        oldDistrict: 'Huyện Chợ Mới',
        wards: [
          ['Thị trấn Chợ Mới', '30628'],
          ['Thị trấn Hội An', '30673'],
          ['Thị trấn Mỹ Luông', '30631'],
          ['Xã An Thạnh Trung', '30664'],
          ['Xã Bình Phước Xuân', '30643'],
          ['Xã Hòa An', '30673'],
          ['Xã Hòa Bình', '30673'],
          ['Xã Kiến An', '30628'],
          ['Xã Kiến Thành', '30628'],
          ['Xã Long Điền A', '30631'],
          ['Xã Long Điền B', '30631'],
          ['Xã Long Giang', '30658'],
          ['Xã Long Kiến', '30664'],
          ['Xã Mỹ An', '30664'],
          ['Xã Mỹ Hiệp', '30643'],
          ['Xã Mỹ Hội Đông', '30658'],
          ['Xã Nhơn Mỹ', '30658'],
          ['Xã Tấn Mỹ', '30643']
        ]
      },
      {
        oldDistrict: 'Huyện Phú Tân',
        wards: [
          ['Thị trấn Chợ Vàm', '30409'],
          ['Thị trấn Phú Mỹ', '30406'],
          ['Xã Bình Thạnh Đông', '30445'],
          ['Xã Hiệp Xương', '30445'],
          ['Xã Hoà Lạc', '30430'],
          ['Xã Long Hoà', '30421'],
          ['Xã Phú An', '30436'],
          ['Xã Phú Bình', '30445'],
          ['Xã Phú Hiệp', '30430'],
          ['Xã Phú Hưng', '30406'],
          ['Xã Phú Lâm', '30421'],
          ['Xã Phú Long', '30421'],
          ['Xã Phú Thạnh', '30409'],
          ['Xã Phú Thành', '30409'],
          ['Xã Phú Thọ', '30436'],
          ['Xã Phú Xuân', '30436'],
          ['Xã Tân Hòa', '30406'],
          ['Xã Tân Trung', '30406']
        ]
      },
      {
        oldDistrict: 'Huyện Thoại Sơn',
        wards: [
          ['Thị trấn Núi Sập', '30682'],
          ['Thị trấn Óc Eo', '30688'],
          ['Thị trấn Phú Hoà', '30685'],
          ['Xã An Bình', '30691'],
          ['Xã Bình Thành', '30682'],
          ['Xã Định Mỹ', '30709'],
          ['Xã Định Thành', '30709'],
          ['Xã Mỹ Phú Đông', '30691'],
          ['Xã Phú Thuận', '30685'],
          ['Xã Tây Phú', '30691'],
          ['Xã Thoại Giang', '30682'],
          ['Xã Vĩnh Chánh', '30685'],
          ['Xã Vĩnh Khánh', '30697'],
          ['Xã Vĩnh Phú', '30709'],
          ['Xã Vĩnh Trạch', '30697'],
          ['Xã Vọng Đông', '30688'],
          ['Xã Vọng Thê', '30688']
        ]
      },
      {
        oldDistrict: 'Huyện Tri Tôn',
        wards: [
          ['Thị trấn Ba Chúc', '30547'],
          ['Thị trấn Cô Tô', '30580'],
          ['Thị trấn Tri Tôn', '30544'],
          ['Xã An Tức', '30577'],
          ['Xã Châu Lăng', '30544'],
          ['Xã Lạc Quới', '30547'],
          ['Xã Lê Trì', '30547'],
          ['Xã Lương An Trà', '30568'],
          ['Xã Lương Phi', '30577'],
          ['Xã Núi Tô', '30544'],
          ['Xã Ô Lâm', '30577'],
          ['Xã Tà Đảnh', '30580'],
          ['Xã Tân Tuyến', '30580'],
          ['Xã Vĩnh Gia', '30568'],
          ['Xã Vĩnh Phước', '30568']
        ]
      },
      {
        oldDistrict: 'Thành phố Châu Đốc',
        wards: [
          ['Phường Châu Phú A', '30316'],
          ['Phường Châu Phú B', '30316'],
          ['Phường Núi Sam', '30325'],
          ['Phường Vĩnh Mỹ', '30316'],
          ['Phường Vĩnh Ngươn', '30316'],
          ['Xã Vĩnh Châu', '30325'],
          ['Xã Vĩnh Tế', '30325']
        ]
      },
      {
        oldDistrict: 'Thành phố Long Xuyên',
        wards: [
          ['Phường Bình Đức', '30292'],
          ['Phường Bình Khánh', '30292'],
          ['Phường Mỹ Bình', '30307'],
          ['Phường Mỹ Hòa', '30307'],
          ['Phường Mỹ Long', '30307'],
          ['Phường Mỹ Phước', '30307'],
          ['Phường Mỹ Quý', '30307'],
          ['Phường Mỹ Thạnh', '30301'],
          ['Phường Mỹ Thới', '30301'],
          ['Phường Mỹ Xuyên', '30307'],
          ['Xã Mỹ Hoà Hưng', '30313'],
          ['Xã Mỹ Khánh', '30292']
        ]
      },
      {
        oldDistrict: 'Thị xã Tân Châu',
        wards: [
          ['Phường Long Châu', '30377'],
          ['Phường Long Hưng', '30377'],
          ['Phường Long Phú', '30377'],
          ['Phường Long Sơn', '30376'],
          ['Phường Long Thạnh', '30376'],
          ['Xã Châu Phong', '30403'],
          ['Xã Lê Chánh', '30403'],
          ['Xã Long An', '30388'],
          ['Xã Phú Lộc', '30385'],
          ['Xã Phú Vĩnh', '30403'],
          ['Xã Tân An', '30388'],
          ['Xã Tân Thạnh', '30388'],
          ['Xã Vĩnh Hòa', '30385'],
          ['Xã Vĩnh Xương', '30385']
        ]
      },
      {
        oldDistrict: 'Thị xã Tịnh Biên',
        wards: [
          ['Phường An Phú', '30520'],
          ['Phường Chi Lăng', '30505'],
          ['Phường Nhà Bàng', '30502'],
          ['Phường Nhơn Hưng', '30502'],
          ['Phường Núi Voi', '30505'],
          ['Phường Thới Sơn', '30502'],
          ['Phường Tịnh Biên', '30520'],
          ['Xã An Cư', '30526'],
          ['Xã An Hảo', '30538'],
          ['Xã An Nông', '30520'],
          ['Xã Tân Lập', '30538'],
          ['Xã Tân Lợi', '30505'],
          ['Xã Văn Giáo', '30526'],
          ['Xã Vĩnh Trung', '30526']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Bà Rịa - Vũng Tàu',
    districts: [
      {
        oldDistrict: 'Huyện Châu Đức',
        wards: [
          ['Thị trấn Kim Long', '26608'],
          ['Thị trấn Ngãi Giao', '26575'],
          ['Xã Bàu Chinh', '26608'],
          ['Xã Bình Ba', '26575'],
          ['Xã Bình Giã', '26590'],
          ['Xã Bình Trung', '26590'],
          ['Xã Cù Bị', '26596'],
          ['Xã Đá Bạc', '26617'],
          ['Xã Láng Lớn', '26608'],
          ['Xã Nghĩa Thành', '26617'],
          ['Xã Quảng Thành', '26590'],
          ['Xã Sơn Bình', '26584'],
          ['Xã Suối Nghệ', '26575'],
          ['Xã Suối Rao', '26584'],
          ['Xã Xà Bang', '26596'],
          ['Xã Xuân Sơn', '26584']
        ]
      },
      {
        oldDistrict: 'Huyện Côn Đảo',
        wards: [['Huyện đảo Côn Đảo (không chia phường/xã)', '26732']]
      },
      {
        oldDistrict: 'Huyện Long Đất',
        wards: [
          ['Thị trấn Đất Đỏ', '26680'],
          ['Thị trấn Long Điền', '26659'],
          ['Thị trấn Long Hải', '26662'],
          ['Thị trấn Phước Hải', '26686'],
          ['Xã Láng Dài', '26680'],
          ['Xã Long Tân', '26680'],
          ['Xã Phước Hội', '26686'],
          ['Xã Phước Hưng', '26662'],
          ['Xã Phước Long Thọ', '26680'],
          ['Xã Phước Tỉnh', '26662'],
          ['Xã Tam An', '26659']
        ]
      },
      {
        oldDistrict: 'Huyện Xuyên Mộc',
        wards: [
          ['Thị trấn Phước Bửu', '26620'],
          ['Xã Bàu Lâm', '26638'],
          ['Xã Bình Châu', '26656'],
          ['Xã Bông Trang', '26632'],
          ['Xã Bưng Riềng', '26632'],
          ['Xã Hòa Bình', '26641'],
          ['Xã Hòa Hiệp', '26647'],
          ['Xã Hòa Hội', '26641'],
          ['Xã Hòa Hưng', '26641'],
          ['Xã Phước Tân', '26620'],
          ['Xã Phước Thuận', '26620'],
          ['Xã Tân Lâm', '26638'],
          ['Xã Xuyên Mộc', '26632']
        ]
      },
      {
        oldDistrict: 'Thành phố Bà Rịa',
        wards: [
          ['Phường Kim Dinh', '26566'],
          ['Phường Long Hương', '26566'],
          ['Phường Long Tâm', '26572'],
          ['Phường Long Toàn', '26560'],
          ['Phường Phước Hưng', '26560'],
          ['Phường Phước Nguyên', '26560'],
          ['Phường Phước Trung', '26560'],
          ['Xã Hoà Long', '26572'],
          ['Xã Long Phước', '26572'],
          ['Xã Tân Hưng', '26566']
        ]
      },
      {
        oldDistrict: 'Thành phố Phú Mỹ',
        wards: [
          ['Phường Hắc Dịch', '26725'],
          ['Phường Mỹ Xuân', '26704'],
          ['Phường Phú Mỹ', '26704'],
          ['Phường Phước Hoà', '26713'],
          ['Phường Tân Hải', '26710'],
          ['Phường Tân Hoà', '26710'],
          ['Phường Tân Phước', '26713'],
          ['Xã Châu Pha', '26728'],
          ['Xã Sông Xoài', '26725'],
          ['Xã Tóc Tiên', '26728']
        ]
      },
      {
        oldDistrict: 'Thành phố Vũng Tàu',
        wards: [
          ['Phường 1', '26506'],
          ['Phường 2', '26506'],
          ['Phường 3', '26506'],
          ['Phường 4', '26506'],
          ['Phường 5', '26506'],
          ['Phường 7', '26526'],
          ['Phường 8', '26526'],
          ['Phường 9', '26526'],
          ['Phường 10', '26536'],
          ['Phường 11', '26542'],
          ['Phường 12', '26542'],
          ['Phường Nguyễn An Ninh', '26526'],
          ['Phường Rạch Dừa', '26536'],
          ['Phường Thắng Nhất', '26536'],
          ['Phường Thắng Nhì', '26506'],
          ['Phường Thắng Tam', '26506'],
          ['Xã Long Sơn', '26545']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Bạc Liêu',
    districts: [
      {
        oldDistrict: 'Huyện Đông Hải',
        wards: [
          ['Thị trấn Gành Hào', '31972'],
          ['Xã An Phúc', '31993'],
          ['Xã An Trạch', '31988'],
          ['Xã An Trạch A', '31988'],
          ['Xã Điền Hải', '31985'],
          ['Xã Định Thành', '31993'],
          ['Xã Định Thành A', '31993'],
          ['Xã Long Điền', '31985'],
          ['Xã Long Điền Đông', '31975'],
          ['Xã Long Điền Đông A', '31975'],
          ['Xã Long Điền Tây', '31972']
        ]
      },
      {
        oldDistrict: 'Huyện Hoà Bình',
        wards: [
          ['Thị trấn Hòa Bình', '31891'],
          ['Xã Minh Diệu', '31918'],
          ['Xã Vĩnh Bình', '31918'],
          ['Xã Vĩnh Hậu', '31927'],
          ['Xã Vĩnh Hậu A', '31927'],
          ['Xã Vĩnh Mỹ A', '31891'],
          ['Xã Vĩnh Mỹ B', '31918'],
          ['Xã Vĩnh Thịnh', '31927']
        ]
      },
      {
        oldDistrict: 'Huyện Hồng Dân',
        wards: [
          ['Thị trấn Ngan Dừa', '31843'],
          ['Xã Lộc Ninh', '31843'],
          ['Xã Ninh Hòa', '31843'],
          ['Xã Ninh Quới', '31849'],
          ['Xã Ninh Quới A', '31849'],
          ['Xã Ninh Thạnh Lợi', '31864'],
          ['Xã Ninh Thạnh Lợi A', '31864'],
          ['Xã Vĩnh Lộc', '31858'],
          ['Xã Vĩnh Lộc A', '31858']
        ]
      },
      {
        oldDistrict: 'Huyện Phước Long',
        wards: [
          ['Thị trấn Phước Long', '31867'],
          ['Xã Hưng Phú', '31882'],
          ['Xã Phong Thạnh Tây A', '31885'],
          ['Xã Phong Thạnh Tây B', '31885'],
          ['Xã Phước Long', '31876'],
          ['Xã Vĩnh Phú Đông', '31867'],
          ['Xã Vĩnh Phú Tây', '31876'],
          ['Xã Vĩnh Thanh', '31882']
        ]
      },
      {
        oldDistrict: 'Huyện Vĩnh Lợi',
        wards: [
          ['Thị trấn Châu Hưng', '31900'],
          ['Xã Châu Hưng A', '31900'],
          ['Xã Châu Thới', '31894'],
          ['Xã Hưng Hội', '31906'],
          ['Xã Hưng Thành', '31906'],
          ['Xã Long Thạnh', '31891'],
          ['Xã Vĩnh Hưng', '31894'],
          ['Xã Vĩnh Hưng A', '31894']
        ]
      },
      {
        oldDistrict: 'Thành phố Bạc Liêu',
        wards: [
          ['Phường 1', '31825'],
          ['Phường 2', '31825'],
          ['Phường 3', '31825'],
          ['Phường 5', '31834'],
          ['Phường 7', '31825'],
          ['Phường 8', '31825'],
          ['Phường Nhà Mát', '31840'],
          ['Xã Hiệp Thành', '31840'],
          ['Xã Vĩnh Trạch', '31834'],
          ['Xã Vĩnh Trạch Đông', '31840']
        ]
      },
      {
        oldDistrict: 'Thị xã Giá Rai',
        wards: [
          ['Phường 1', '31942'],
          ['Phường Hộ Phòng', '31942'],
          ['Phường Láng Tròn', '31951'],
          ['Xã Phong Tân', '31951'],
          ['Xã Phong Thạnh', '31942'],
          ['Xã Phong Thạnh A', '31942'],
          ['Xã Phong Thạnh Đông', '31951'],
          ['Xã Phong Thạnh Tây', '31957'],
          ['Xã Tân Phong', '31957'],
          ['Xã Tân Thạnh', '31957']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Bắc Giang',
    districts: [
      {
        oldDistrict: 'Huyện Hiệp Hòa',
        wards: [
          ['Thị trấn Bắc Lý', '07870'],
          ['Thị trấn Thắng', '07840'],
          ['Xã Châu Minh', '07870'],
          ['Xã Danh Thắng', '07840'],
          ['Xã Đoan Bái', '07840'],
          ['Xã Đông Lỗ', '07840'],
          ['Xã Đồng Tiến', '07822'],
          ['Xã Hoàng Vân', '07822'],
          ['Xã Hợp Thịnh', '07864'],
          ['Xã Hùng Thái', '07864'],
          ['Xã Hương Lâm', '07870'],
          ['Xã Lương Phong', '07840'],
          ['Xã Mai Đình', '07870'],
          ['Xã Mai Trung', '07864'],
          ['Xã Ngọc Sơn', '07822'],
          ['Xã Sơn Thịnh', '07864'],
          ['Xã Thường Thắng', '07864'],
          ['Xã Toàn Thắng', '07822'],
          ['Xã Xuân Cẩm', '07870']
        ]
      },
      {
        oldDistrict: 'Huyện Lạng Giang',
        wards: [
          ['Thị trấn Kép', '07399'],
          ['Thị trấn Vôi', '07375'],
          ['Xã An Hà', '07381'],
          ['Xã Dương Đức', '07420'],
          ['Xã Đại Lâm', '07432'],
          ['Xã Đào Mỹ', '07381'],
          ['Xã Hương Lạc', '07375'],
          ['Xã Hương Sơn', '07399'],
          ['Xã Mỹ Thái', '07420'],
          ['Xã Nghĩa Hòa', '07381'],
          ['Xã Nghĩa Hưng', '07381'],
          ['Xã Quang Thịnh', '07399'],
          ['Xã Tân Dĩnh', '07432'],
          ['Xã Tân Hưng', '07375'],
          ['Xã Tân Thanh', '07420'],
          ['Xã Thái Đào', '07432'],
          ['Xã Tiên Lục', '07381'],
          ['Xã Xuân Hương', '07420'],
          ['Xã Xương Lâm', '07375']
        ]
      },
      {
        oldDistrict: 'Huyện Lục Nam',
        wards: [
          ['Thị trấn Đồi Ngô', '07444'],
          ['Thị trấn Phương Sơn', '07444'],
          ['Xã Bảo Đài', '07462'],
          ['Xã Bảo Sơn', '07462'],
          ['Xã Bắc Lũng', '07498'],
          ['Xã Bình Sơn', '07492'],
          ['Xã Cẩm Lý', '07519'],
          ['Xã Chu Điện', '07444'],
          ['Xã Cương Sơn', '07444'],
          ['Xã Đan Hội', '07519'],
          ['Xã Đông Hưng', '07450'],
          ['Xã Đông Phú', '07450'],
          ['Xã Huyền Sơn', '07486'],
          ['Xã Khám Lạng', '07498'],
          ['Xã Lan Mẫu', '07498'],
          ['Xã Lục Sơn', '07492'],
          ['Xã Nghĩa Phương', '07486'],
          ['Xã Tam Dị', '07462'],
          ['Xã Thanh Lâm', '07462'],
          ['Xã Tiên Nha', '07444'],
          ['Xã Trường Giang', '07486'],
          ['Xã Trường Sơn', '07489'],
          ['Xã Vô Tranh', '07489'],
          ['Xã Yên Sơn', '07498']
        ]
      },
      {
        oldDistrict: 'Huyện Lục Ngạn',
        wards: [
          ['Thị trấn Biển Động', '07573'],
          ['Thị trấn Phì Điền', '07582'],
          ['Xã Biên Sơn', '07537'],
          ['Xã Cấm Sơn', '07531'],
          ['Xã Đèo Gia', '07594'],
          ['Xã Đồng Cốc', '07582'],
          ['Xã Giáp Sơn', '07582'],
          ['Xã Hộ Đáp', '07543'],
          ['Xã Kim Sơn', '07573'],
          ['Xã Phong Minh', '07534'],
          ['Xã Phong Vân', '07537'],
          ['Xã Phú Nhuận', '07573'],
          ['Xã Sa Lý', '07534'],
          ['Xã Sơn Hải', '07543'],
          ['Xã Tân Hoa', '07582'],
          ['Xã Tân Lập', '07594'],
          ['Xã Tân Mộc', '07603'],
          ['Xã Tân Quang', '07582'],
          ['Xã Tân Sơn', '07531']
        ]
      },
      {
        oldDistrict: 'Huyện Sơn Động',
        wards: [
          ['Thị trấn An Châu', '07615'],
          ['Thị trấn Tây Yên Tử', '07616'],
          ['Xã An Bá', '07615'],
          ['Xã An Lạc', '07654'],
          ['Xã Cẩm Đàn', '07642'],
          ['Xã Dương Hưu', '07672'],
          ['Xã Đại Sơn', '07627'],
          ['Xã Giáo Liêm', '07627'],
          ['Xã Hữu Sản', '07621'],
          ['Xã Lệ Viễn', '07654'],
          ['Xã Long Sơn', '07672'],
          ['Xã Phúc Sơn', '07627'],
          ['Xã Thanh Luận', '07616'],
          ['Xã Tuấn Đạo', '07663'],
          ['Xã Vân Sơn', '07621'],
          ['Xã Vĩnh An', '07615'],
          ['Xã Yên Định', '07642']
        ]
      },
      {
        oldDistrict: 'Huyện Tân Yên',
        wards: [
          ['Thị trấn Cao Thượng', '07339'],
          ['Thị trấn Nhã Nam', '07306'],
          ['Xã An Dương', '07306'],
          ['Xã Cao Xá', '07339'],
          ['Xã Hợp Đức', '07330'],
          ['Xã Lam Sơn', '07333'],
          ['Xã Liên Chung', '07330'],
          ['Xã Liên Sơn', '07306'],
          ['Xã Ngọc Châu', '07351'],
          ['Xã Ngọc Lý', '07339'],
          ['Xã Ngọc Thiện', '07351'],
          ['Xã Ngọc Vân', '07351'],
          ['Xã Phúc Hòa', '07330'],
          ['Xã Quang Trung', '07333'],
          ['Xã Quế Nham', '07228'],
          ['Xã Song Vân', '07351'],
          ['Xã Tân Trung', '07306'],
          ['Xã Việt Lập', '07339'],
          ['Xã Việt Ngọc', '07351']
        ]
      },
      {
        oldDistrict: 'Huyện Yên Thế',
        wards: [
          ['Thị trấn Bố Hạ', '07294'],
          ['Thị trấn Phồn Xương', '07288'],
          ['Xã An Thượng', '07264'],
          ['Xã Canh Nậu', '07246'],
          ['Xã Đồng Hưu', '07282'],
          ['Xã Đồng Kỳ', '07282'],
          ['Xã Đồng Lạc', '07288'],
          ['Xã Đông Sơn', '07294'],
          ['Xã Đồng Tâm', '07288'],
          ['Xã Đồng Tiến', '07246'],
          ['Xã Đồng Vương', '07282'],
          ['Xã Hương Vĩ', '07294'],
          ['Xã Tam Tiến', '07264'],
          ['Xã Tân Hiệp', '07288'],
          ['Xã Tân Sỏi', '07288'],
          ['Xã Tiến Thắng', '07264'],
          ['Xã Xuân Lương', '07246']
        ]
      },
      {
        oldDistrict: 'Thành phố Bắc Giang',
        wards: [
          ['Phường Cảnh Thụy', '07738'],
          ['Phường Dĩnh Kế', '07210'],
          ['Phường Dĩnh Trì', '07210'],
          ['Phường Đa Mai', '07228'],
          ['Phường Đồng Sơn', '07696'],
          ['Phường Hoàng Văn Thụ', '07210'],
          ['Phường Hương Gián', '07699'],
          ['Phường Mỹ Độ', '07228'],
          ['Phường Ngô Quyền', '07210'],
          ['Phường Nham Biền', '07681'],
          ['Phường Nội Hoàng', '07696'],
          ['Phường Song Khê', '07696'],
          ['Phường Song Mai', '07228'],
          ['Phường Tân An', '07682'],
          ['Phường Tân Liễu', '07681'],
          ['Phường Tân Mỹ', '07228'],
          ['Phường Tân Tiến', '07699'],
          ['Phường Thọ Xương', '07210'],
          ['Phường Tiền Phong', '07696'],
          ['Phường Trần Phú', '07210'],
          ['Phường Xương Giang', '07210'],
          ['Xã Đồng Phúc', '07735'],
          ['Xã Đồng Việt', '07735'],
          ['Xã Đức Giang', '07735'],
          ['Xã Lãng Sơn', '07682'],
          ['Xã Quỳnh Sơn', '07682'],
          ['Xã Tiến Dũng', '07738'],
          ['Xã Trí Yên', '07682'],
          ['Xã Tư Mại', '07738'],
          ['Xã Xuân Phú', '07699'],
          ['Xã Yên Lư', '07681']
        ]
      },
      {
        oldDistrict: 'Thị xã Chũ',
        wards: [
          ['Phường Chũ', '07525'],
          ['Phường Hồng Giang', '07525'],
          ['Phường Phượng Sơn', '07612'],
          ['Phường Thanh Hải', '07525'],
          ['Phường Trù Hựu', '07525'],
          ['Xã Kiên Lao', '07552'],
          ['Xã Kiên Thành', '07552'],
          ['Xã Mỹ An', '07612'],
          ['Xã Nam Dương', '07603'],
          ['Xã Quý Sơn', '07612']
        ]
      },
      {
        oldDistrict: 'Thị xã Việt Yên',
        wards: [
          ['Phường Bích Động', '07777'],
          ['Phường Hồng Thái', '07777'],
          ['Phường Nếnh', '07795'],
          ['Phường Ninh Sơn', '07798'],
          ['Phường Quang Châu', '07795'],
          ['Phường Quảng Minh', '07798'],
          ['Phường Tăng Tiến', '07795'],
          ['Phường Tự Lạn', '07774'],
          ['Phường Vân Trung', '07795'],
          ['Xã Hương Mai', '07774'],
          ['Xã Minh Đức', '07777'],
          ['Xã Nghĩa Trung', '07777'],
          ['Xã Thượng Lan', '07774'],
          ['Xã Tiên Sơn', '07798'],
          ['Xã Trung Sơn', '07798'],
          ['Xã Vân Hà', '07798'],
          ['Xã Việt Tiến', '07774']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Bắc Kạn',
    districts: [
      {
        oldDistrict: 'Huyện Ba Bể',
        wards: [
          ['Thị trấn Chợ Rã', '01912'],
          ['Xã Bành Trạch', '01894'],
          ['Xã Cao Thượng', '01906'],
          ['Xã Chu Hương', '01921'],
          ['Xã Địa Linh', '01912'],
          ['Xã Đồng Phúc', '01933'],
          ['Xã Hà Hiệu', '01894'],
          ['Xã Hoàng Trĩ', '01933'],
          ['Xã Khang Ninh', '01906'],
          ['Xã Mỹ Phương', '01921'],
          ['Xã Nam Mẫu', '01906'],
          ['Xã Phúc Lộc', '01894'],
          ['Xã Quảng Khê', '01933'],
          ['Xã Thượng Giáo', '01912'],
          ['Xã Yến Dương', '01921']
        ]
      },
      {
        oldDistrict: 'Huyện Bạch Thông',
        wards: [
          ['Thị trấn Phủ Thông', '01969'],
          ['Xã Cao Sơn', '01981'],
          ['Xã Cẩm Giàng', '02008'],
          ['Xã Dương Phong', '02014'],
          ['Xã Đôn Phong', '01849'],
          ['Xã Lục Bình', '01969'],
          ['Xã Mỹ Thanh', '02008'],
          ['Xã Nguyên Phúc', '02008'],
          ['Xã Quang Thuận', '02014'],
          ['Xã Quân Hà', '02008'],
          ['Xã Sĩ Bình', '01981'],
          ['Xã Tân Tú', '01969'],
          ['Xã Vi Hương', '01969'],
          ['Xã Vũ Muộn', '01981']
        ]
      },
      {
        oldDistrict: 'Huyện Chợ Đồn',
        wards: [
          ['Thị trấn Bằng Lũng', '02020'],
          ['Xã Bản Thi', '02044'],
          ['Xã Bằng Lãng', '02020'],
          ['Xã Bằng Phúc', '01933'],
          ['Xã Bình Trung', '02071'],
          ['Xã Đại Sảo', '02083'],
          ['Xã Đồng Lạc', '02026'],
          ['Xã Đồng Thắng', '02014'],
          ['Xã Lương Bằng', '02071'],
          ['Xã Nam Cường', '02026'],
          ['Xã Nghĩa Tá', '02071'],
          ['Xã Ngọc Phái', '02020'],
          ['Xã Phương Viên', '02020'],
          ['Xã Quảng Bạch', '02038'],
          ['Xã Tân Lập', '02038'],
          ['Xã Xuân Lạc', '02026'],
          ['Xã Yên Mỹ', '02083'],
          ['Xã Yên Phong', '02083'],
          ['Xã Yên Thịnh', '02044'],
          ['Xã Yên Thượng', '02044']
        ]
      },
      {
        oldDistrict: 'Huyện Chợ Mới',
        wards: [
          ['Thị trấn Đồng Tâm', '02086'],
          ['Xã Bình Văn', '02116'],
          ['Xã Cao Kỳ', '02104'],
          ['Xã Hoà Mục', '02104'],
          ['Xã Mai Lạp', '02101'],
          ['Xã Như Cố', '02086'],
          ['Xã Nông Hạ', '02107'],
          ['Xã Quảng Chu', '02086'],
          ['Xã Tân Sơn', '02104'],
          ['Xã Thanh Mai', '02101'],
          ['Xã Thanh Thịnh', '02107'],
          ['Xã Thanh Vận', '02101'],
          ['Xã Yên Cư', '02116'],
          ['Xã Yên Hân', '02116']
        ]
      },
      {
        oldDistrict: 'Huyện Na Rì',
        wards: [
          ['Thị trấn Yến Lạc', '02155'],
          ['Xã Côn Minh', '02185'],
          ['Xã Cư Lễ', '02176'],
          ['Xã Cường Lợi', '02152'],
          ['Xã Dương Sơn', '02185'],
          ['Xã Đổng Xá', '02191'],
          ['Xã Kim Hỷ', '02143'],
          ['Xã Kim Lư', '02155'],
          ['Xã Liêm Thuỷ', '02191'],
          ['Xã Lương Thượng', '02143'],
          ['Xã Quang Phong', '02185'],
          ['Xã Sơn Thành', '02155'],
          ['Xã Trần Phú', '02176'],
          ['Xã Văn Lang', '02143'],
          ['Xã Văn Minh', '02176'],
          ['Xã Văn Vũ', '02152'],
          ['Xã Xuân Dương', '02191']
        ]
      },
      {
        oldDistrict: 'Huyện Ngân Sơn',
        wards: [
          ['Thị trấn Nà Phặc', '01936'],
          ['Thị trấn Vân Tùng', '01954'],
          ['Xã Bằng Vân', '01942'],
          ['Xã Cốc Đán', '01954'],
          ['Xã Đức Vân', '01954'],
          ['Xã Hiệp Lực', '01960'],
          ['Xã Thuần Mang', '01960'],
          ['Xã Thượng Ân', '01942'],
          ['Xã Thượng Quan', '01957'],
          ['Xã Trung Hoà', '01936']
        ]
      },
      {
        oldDistrict: 'Huyện Pác Nặm',
        wards: [
          ['Xã An Thắng', '01882'],
          ['Xã Bằng Thành', '01864'],
          ['Xã Bộc Bố', '01864'],
          ['Xã Cao Tân', '01879'],
          ['Xã Cổ Linh', '01879'],
          ['Xã Công Bằng', '01879'],
          ['Xã Giáo Hiệu', '01864'],
          ['Xã Nghiên Loan', '01882'],
          ['Xã Nhạn Môn', '01864'],
          ['Xã Xuân La', '01882']
        ]
      },
      {
        oldDistrict: 'Thành phố Bắc Kạn',
        wards: [
          ['Phường Đức Xuân', '01840'],
          ['Phường Huyền Tụng', '01840'],
          ['Phường Nguyễn Thị Minh Khai', '01840'],
          ['Phường Phùng Chí Kiên', '01843'],
          ['Phường Sông Cầu', '01843'],
          ['Phường Xuất Hóa', '01843'],
          ['Xã Dương Quang', '01849'],
          ['Xã Nông Thượng', '01843']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Bắc Ninh',
    districts: [
      {
        oldDistrict: 'Huyện Gia Bình',
        wards: [
          ['Thị trấn Gia Bình', '09454'],
          ['Thị trấn Nhân Thắng', '09475'],
          ['Xã Bình Dương', '09475'],
          ['Xã Cao Đức', '09466'],
          ['Xã Đại Bái', '09454'],
          ['Xã Đại Lai', '09469'],
          ['Xã Đông Cứu', '09487'],
          ['Xã Giang Sơn', '09487'],
          ['Xã Lãng Ngâm', '09487'],
          ['Xã Quỳnh Phú', '09454'],
          ['Xã Song Giang', '09469'],
          ['Xã Thái Bảo', '09475'],
          ['Xã Vạn Ninh', '09466'],
          ['Xã Xuân Lai', '09454']
        ]
      },
      {
        oldDistrict: 'Huyện Lương Tài',
        wards: [
          ['Thị trấn Thứa', '09496'],
          ['Xã An Tập', '09499'],
          ['Xã An Thịnh', '09499'],
          ['Xã Bình Định', '09529'],
          ['Xã Lâm Thao', '09529'],
          ['Xã Phú Hòa', '09496'],
          ['Xã Phú Lương', '09523'],
          ['Xã Quang Minh', '09523'],
          ['Xã Quảng Phú', '09529'],
          ['Xã Tân Lãng', '09496'],
          ['Xã Trung Chính', '09523'],
          ['Xã Trung Kênh', '09499']
        ]
      },
      {
        oldDistrict: 'Huyện Tiên Du',
        wards: [
          ['Thị trấn Lim', '09319'],
          ['Xã Cảnh Hưng', '09349'],
          ['Xã Đại Đồng', '09340'],
          ['Xã Hiên Vân', '09334'],
          ['Xã Hoàn Sơn', '09340'],
          ['Xã Lạc Vệ', '09343'],
          ['Xã Liên Bão', '09334'],
          ['Xã Minh Đạo', '09349'],
          ['Xã Nội Duệ', '09319'],
          ['Xã Phật Tích', '09349'],
          ['Xã Phú Lâm', '09319'],
          ['Xã Tân Chi', '09343'],
          ['Xã Tri Phương', '09340'],
          ['Xã Việt Đoàn', '09334']
        ]
      },
      {
        oldDistrict: 'Huyện Yên Phong',
        wards: [
          ['Thị trấn Chờ', '09193'],
          ['Xã Dũng Liệt', '09205'],
          ['Xã Đông Phong', '09208'],
          ['Xã Đông Thọ', '09238'],
          ['Xã Đông Tiến', '09193'],
          ['Xã Hòa Tiến', '09202'],
          ['Xã Long Châu', '09193'],
          ['Xã Tam Đa', '09208'],
          ['Xã Tam Giang', '09202'],
          ['Xã Thụy Hòa', '09208'],
          ['Xã Trung Nghĩa', '09193'],
          ['Xã Văn Môn', '09238'],
          ['Xã Yên Phụ', '09238'],
          ['Xã Yên Trung', '09205']
        ]
      },
      {
        oldDistrict: 'Thành phố Bắc Ninh',
        wards: [
          ['Phường Đại Phúc', '09190'],
          ['Phường Đáp Cầu', '09169'],
          ['Phường Hạp Lĩnh', '09325'],
          ['Phường Hòa Long', '09187'],
          ['Phường Khắc Niệm', '09325'],
          ['Phường Khúc Xuyên', '09187'],
          ['Phường Kim Chân', '09169'],
          ['Phường Kinh Bắc', '09187'],
          ['Phường Nam Sơn', '09286'],
          ['Phường Phong Khê', '09190'],
          ['Phường Suối Hoa', '09187'],
          ['Phường Thị Cầu', '09169'],
          ['Phường Tiền Ninh Vệ', '09187'],
          ['Phường Vạn An', '09187'],
          ['Phường Vân Dương', '09286'],
          ['Phường Võ Cường', '09190'],
          ['Phường Vũ Ninh', '09169']
        ]
      },
      {
        oldDistrict: 'Thành phố Từ Sơn',
        wards: [
          ['Phường Châu Khê', '09379'],
          ['Phường Đình Bảng', '09367'],
          ['Phường Đồng Kỵ', '09385'],
          ['Phường Đông Ngàn', '09367'],
          ['Phường Đồng Nguyên', '09385'],
          ['Phường Hương Mạc', '09379'],
          ['Phường Phù Chẩn', '09367'],
          ['Phường Phù Khê', '09379'],
          ['Phường Tam Sơn', '09370'],
          ['Phường Tân Hồng', '09367'],
          ['Phường Trang Hạ', '09385'],
          ['Phường Tương Giang', '09370']
        ]
      },
      {
        oldDistrict: 'Thị xã Quế Võ',
        wards: [
          ['Phường Bằng An', '09247'],
          ['Phường Bồng Lai', '09295'],
          ['Phường Cách Bi', '09295'],
          ['Phường Đại Xuân', '09253'],
          ['Phường Nhân Hòa', '09253'],
          ['Phường Phố Mới', '09247'],
          ['Phường Phù Lương', '09301'],
          ['Phường Phương Liễu', '09265'],
          ['Phường Phượng Mao', '09265'],
          ['Phường Quế Tân', '09247'],
          ['Phường Việt Hùng', '09247'],
          ['Xã Châu Phong', '09292'],
          ['Xã Chi Lăng', '09313'],
          ['Xã Đào Viên', '09301'],
          ['Xã Đức Long', '09292'],
          ['Xã Mộ Đạo', '09295'],
          ['Xã Ngọc Xá', '09301'],
          ['Xã Phù Lãng', '09292'],
          ['Xã Việt Thống', '09253'],
          ['Xã Yên Giả', '09313']
        ]
      },
      {
        oldDistrict: 'Thị xã Thuận Thành',
        wards: [
          ['Phường An Bình', '09409'],
          ['Phường Gia Đông', '09400'],
          ['Phường Hà Mãn', '09433'],
          ['Phường Hồ', '09400'],
          ['Phường Ninh Xá', '09445'],
          ['Phường Song Hồ', '09400'],
          ['Phường Thanh Khương', '09427'],
          ['Phường Trạm Lộ', '09430'],
          ['Phường Trí Quả', '09427'],
          ['Phường Xuân Lâm', '09433'],
          ['Xã Đại Đồng Thành', '09400'],
          ['Xã Đình Tổ', '09427'],
          ['Xã Hoài Thượng', '09409'],
          ['Xã Mão Điền', '09409'],
          ['Xã Nghĩa Đạo', '09430'],
          ['Xã Ngũ Thái', '09433'],
          ['Xã Nguyệt Đức', '09445'],
          ['Xã Song Liễu', '09433']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Bến Tre',
    districts: [
      {
        oldDistrict: 'Huyện Ba Tri',
        wards: [
          ['Thị trấn Ba Tri', '29110'],
          ['Thị trấn Tiệm Tôm', '29167'],
          ['Xã An Bình Tây', '29110'],
          ['Xã An Đức', '29110'],
          ['Xã An Hiệp', '29158'],
          ['Xã An Hòa Tây', '29167'],
          ['Xã An Ngãi Tây', '29158'],
          ['Xã An Ngãi Trung', '29143'],
          ['Xã An Phú Trung', '29143'],
          ['Xã Bảo Thạnh', '29125'],
          ['Xã Bảo Thuận', '29125'],
          ['Xã Mỹ Chánh', '29122'],
          ['Xã Mỹ Hòa', '29122'],
          ['Xã Mỹ Nhơn', '29122'],
          ['Xã Mỹ Thạnh', '29143'],
          ['Xã Phú Lễ', '29137'],
          ['Xã Phước Ngãi', '29137'],
          ['Xã Tân Hưng', '29158'],
          ['Xã Tân Thủy', '29167'],
          ['Xã Tân Xuân', '29137'],
          ['Xã Vĩnh An', '29110'],
          ['Xã Vĩnh Hòa', '29110']
        ]
      },
      {
        oldDistrict: 'Huyện Bình Đại',
        wards: [
          ['Thị trấn Bình Đại', '29050'],
          ['Xã Bình Thắng', '29050'],
          ['Xã Bình Thới', '29050'],
          ['Xã Châu Hưng', '29083'],
          ['Xã Đại Hòa Lộc', '29104'],
          ['Xã Định Trung', '29089'],
          ['Xã Long Định', '29062'],
          ['Xã Long Hòa', '29083'],
          ['Xã Lộc Thuận', '29077'],
          ['Xã Phú Long', '29089'],
          ['Xã Phú Thuận', '29062'],
          ['Xã Tam Hiệp', '29062'],
          ['Xã Thạnh Phước', '29104'],
          ['Xã Thạnh Trị', '29089'],
          ['Xã Thới Lai', '29083'],
          ['Xã Thới Thuận', '29107'],
          ['Xã Thừa Đức', '29107'],
          ['Xã Vang Quới Đông', '29077'],
          ['Xã Vang Quới Tây', '29077']
        ]
      },
      {
        oldDistrict: 'Huyện Châu Thành',
        wards: [
          ['Thị trấn Châu Thành', '28810'],
          ['Thị trấn Tiên Thủy', '28861'],
          ['Xã An Phước', '28807'],
          ['Xã Giao Long', '28807'],
          ['Xã Hữu Định', '28858'],
          ['Xã Phú Đức', '28840'],
          ['Xã Phú Túc', '28810'],
          ['Xã Phước Thạnh', '28858'],
          ['Xã Quới Thành', '28861'],
          ['Xã Qưới Sơn', '28807'],
          ['Xã Tam Phước', '28783'],
          ['Xã Tân Phú', '28840'],
          ['Xã Tân Thạch', '28810'],
          ['Xã Thành Triệu', '28861'],
          ['Xã Tiên Long', '28840'],
          ['Xã Tường Đa', '28810']
        ]
      },
      {
        oldDistrict: 'Huyện Chợ Lách',
        wards: [
          ['Thị trấn Chợ Lách', '28870'],
          ['Xã Hòa Nghĩa', '28870'],
          ['Xã Hưng Khánh Trung B', '28901'],
          ['Xã Long Thới', '28870'],
          ['Xã Phú Phụng', '28879'],
          ['Xã Phú Sơn', '28894'],
          ['Xã Sơn Định', '28879'],
          ['Xã Tân Thiềng', '28894'],
          ['Xã Vĩnh Bình', '28879'],
          ['Xã Vĩnh Hòa', '28901'],
          ['Xã Vĩnh Thành', '28894']
        ]
      },
      {
        oldDistrict: 'Huyện Giồng Trôm',
        wards: [
          ['Thị trấn Giồng Trôm', '28984'],
          ['Xã Bình Hoà', '28984'],
          ['Xã Bình Thành', '28984'],
          ['Xã Châu Bình', '28996'],
          ['Xã Châu Hòa', '28996'],
          ['Xã Hưng Lễ', '29044'],
          ['Xã Hưng Nhượng', '29044'],
          ['Xã Hưng Phong', '29020'],
          ['Xã Long Mỹ', '29020'],
          ['Xã Lương Hòa', '28987'],
          ['Xã Lương Phú', '28993'],
          ['Xã Lương Quới', '28996'],
          ['Xã Mỹ Thạnh', '28993'],
          ['Xã Phong Nẫm', '28987'],
          ['Xã Phước Long', '29020'],
          ['Xã Sơn Phú', '28777'],
          ['Xã Tân Hào', '29029'],
          ['Xã Tân Lợi Thạnh', '29029'],
          ['Xã Tân Thanh', '29044'],
          ['Xã Thạnh Phú Đông', '29029'],
          ['Xã Thuận Điền', '28993']
        ]
      },
      {
        oldDistrict: 'Huyện Mỏ Cày Bắc',
        wards: [
          ['Thị trấn Phước Mỹ Trung', '28915'],
          ['Xã Hòa Lộc', '28921'],
          ['Xã Hưng Khánh Trung A', '28901'],
          ['Xã Khánh Thạnh Tân', '28948'],
          ['Xã Nhuận Phú Tân', '28948'],
          ['Xã Phú Mỹ', '28915'],
          ['Xã Tân Bình', '28921'],
          ['Xã Tân Phú Tây', '28915'],
          ['Xã Tân Thành Bình', '28921'],
          ['Xã Tân Thanh Tây', '28948'],
          ['Xã Thành An', '28921'],
          ['Xã Thạnh Ngãi', '28915'],
          ['Xã Thanh Tân', '28789']
        ]
      },
      {
        oldDistrict: 'Huyện Mỏ Cày Nam',
        wards: [
          ['Thị trấn Mỏ Cày', '28903'],
          ['Xã An Định', '28957'],
          ['Xã An Thạnh', '28903'],
          ['Xã An Thới', '28969'],
          ['Xã Bình Khánh', '28945'],
          ['Xã Cẩm Sơn', '28981'],
          ['Xã Đa Phước Hội', '28903'],
          ['Xã Định Thủy', '28945'],
          ['Xã Hương Mỹ', '28981'],
          ['Xã Minh Đức', '28957'],
          ['Xã Ngãi Đăng', '28981'],
          ['Xã Phước Hiệp', '28945'],
          ['Xã Tân Hội', '28903'],
          ['Xã Tân Trung', '28957'],
          ['Xã Thành Thới A', '28969'],
          ['Xã Thành Thới B', '28969']
        ]
      },
      {
        oldDistrict: 'Huyện Thạnh Phú',
        wards: [
          ['Thị trấn Thạnh Phú', '29182'],
          ['Xã An Điền', '29221'],
          ['Xã An Nhơn', '29224'],
          ['Xã An Quy', '29224'],
          ['Xã An Thạnh', '29182'],
          ['Xã An Thuận', '29224'],
          ['Xã Bình Thạnh', '29182'],
          ['Xã Đại Điền', '29194'],
          ['Xã Giao Thạnh', '29227'],
          ['Xã Hòa Lợi', '29191'],
          ['Xã Mỹ An', '29182'],
          ['Xã Mỹ Hưng', '29191'],
          ['Xã Phú Khánh', '29194'],
          ['Xã Quới Điền', '29191'],
          ['Xã Tân Phong', '29194'],
          ['Xã Thạnh Hải', '29221'],
          ['Xã Thạnh Phong', '29227'],
          ['Xã Thới Thạnh', '29194']
        ]
      },
      {
        oldDistrict: 'Thành phố Bến Tre',
        wards: [
          ['Phường 6', '28783'],
          ['Phường 7', '28789'],
          ['Phường 8', '28756'],
          ['Phường An Hội', '28777'],
          ['Phường Phú Khương', '28756'],
          ['Phường Phú Tân', '28858'],
          ['Xã Bình Phú', '28789'],
          ['Xã Mỹ Thạnh An', '28777'],
          ['Xã Nhơn Thạnh', '28756'],
          ['Xã Phú Hưng', '28756'],
          ['Xã Phú Nhuận', '28777'],
          ['Xã Sơn Đông', '28783']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Bình Dương',
    districts: [
      {
        oldDistrict: 'Huyện Bàu Bàng',
        wards: [
          ['Thị trấn Lai Uyên', '25822'],
          ['Xã Cây Trường II', '25819'],
          ['Xã Hưng Hòa', '25837'],
          ['Xã Lai Hưng', '25813'],
          ['Xã Long Nguyên', '25840'],
          ['Xã Tân Hưng', '25813'],
          ['Xã Trừ Văn Thố', '25819']
        ]
      },
      {
        oldDistrict: 'Huyện Bắc Tân Uyên',
        wards: [
          ['Thị trấn Tân Bình', '25912'],
          ['Thị trấn Tân Thành', '25906'],
          ['Xã Bình Mỹ', '25915'],
          ['Xã Đất Cuốc', '25906'],
          ['Xã Hiếu Liêm', '25909'],
          ['Xã Lạc An', '25909'],
          ['Xã Tân Định', '25906'],
          ['Xã Tân Lập', '25888'],
          ['Xã Tân Mỹ', '25888'],
          ['Xã Thường Tân', '25909']
        ]
      },
      {
        oldDistrict: 'Huyện Dầu Tiếng',
        wards: [
          ['Thị trấn Dầu Tiếng', '25777'],
          ['Xã An Lập', '25807'],
          ['Xã Định An', '25777'],
          ['Xã Định Hiệp', '25807'],
          ['Xã Định Thành', '25777'],
          ['Xã Long Hoà', '25792'],
          ['Xã Long Tân', '25792'],
          ['Xã Minh Hoà', '25780'],
          ['Xã Minh Tân', '25780'],
          ['Xã Minh Thạnh', '25780'],
          ['Xã Thanh An', '25807'],
          ['Xã Thanh Tuyền', '25843']
        ]
      },
      {
        oldDistrict: 'Huyện Phú Giáo',
        wards: [
          ['Thị trấn Phước Vĩnh', '25858'],
          ['Xã An Bình', '25858'],
          ['Xã An Linh', '25867'],
          ['Xã An Long', '25867'],
          ['Xã An Thái', '25864'],
          ['Xã Phước Hoà', '25882'],
          ['Xã Phước Sang', '25864'],
          ['Xã Tam Lập', '25858'],
          ['Xã Tân Hiệp', '25864'],
          ['Xã Tân Long', '25867'],
          ['Xã Vĩnh Hoà', '25882']
        ]
      },
      {
        oldDistrict: 'Thành phố Bến Cát',
        wards: [
          ['Phường An Điền', '25840'],
          ['Phường An Tây', '25843'],
          ['Phường Chánh Phú Hòa', '25837'],
          ['Phường Hòa Lợi', '25849'],
          ['Phường Mỹ Phước', '25813'],
          ['Phường Tân Định', '25849'],
          ['Phường Thới Hòa', '25846'],
          ['Xã Phú An', '25768']
        ]
      },
      {
        oldDistrict: 'Thành phố Dĩ An',
        wards: [
          ['Phường An Bình', '25942'],
          ['Phường Bình An', '25951'],
          ['Phường Bình Thắng', '25951'],
          ['Phường Dĩ An', '25942'],
          ['Phường Đông Hòa', '25951'],
          ['Phường Tân Bình', '25945'],
          ['Phường Tân Đông Hiệp', '25945']
        ]
      },
      {
        oldDistrict: 'Thành phố Tân Uyên',
        wards: [
          ['Phường Hội Nghĩa', '25915'],
          ['Phường Khánh Bình', '25920'],
          ['Phường Phú Chánh', '25760'],
          ['Phường Tân Hiệp', '25920'],
          ['Phường Tân Phước Khánh', '25891'],
          ['Phường Tân Vĩnh Hiệp', '25891'],
          ['Phường Thái Hòa', '25891'],
          ['Phường Thạnh Phước', '25891'],
          ['Phường Uyên Hưng', '25888'],
          ['Phường Vĩnh Tân', '25912'],
          ['Xã Bạch Đằng', '25888'],
          ['Xã Thạnh Hội', '25891']
        ]
      },
      {
        oldDistrict: 'Thành phố Thủ Dầu Một',
        wards: [
          ['Phường Chánh Mỹ', '25771'],
          ['Phường Chánh Nghĩa', '25747'],
          ['Phường Định Hoà', '25771'],
          ['Phường Hiệp An', '25768'],
          ['Phường Hiệp Thành', '25750'],
          ['Phường Hoà Phú', '25760'],
          ['Phường Phú Cường', '25747'],
          ['Phường Phú Hòa', '25750'],
          ['Phường Phú Lợi', '25750'],
          ['Phường Phú Mỹ', '25760'],
          ['Phường Phú Tân', '25760'],
          ['Phường Phú Thọ', '25747'],
          ['Phường Tân An', '25768'],
          ['Phường Tương Bình Hiệp', '25771']
        ]
      },
      {
        oldDistrict: 'Thành phố Thuận An',
        wards: [
          ['Phường An Phú', '25975'],
          ['Phường An Thạnh', '25978'],
          ['Phường Bình Chuẩn', '25969'],
          ['Phường Bình Hòa', '25987'],
          ['Phường Bình Nhâm', '25966'],
          ['Phường Hưng Định', '25978'],
          ['Phường Lái Thiêu', '25966'],
          ['Phường Thuận Giao', '25969'],
          ['Phường Vĩnh Phú', '25987'],
          ['Xã An Sơn', '25978']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Bình Định',
    districts: [
      {
        oldDistrict: 'Huyện An Lão',
        wards: [
          ['Thị trấn An Lão', '21609'],
          ['Xã An Dũng', '21616'],
          ['Xã An Hòa', '21628'],
          ['Xã An Hưng', '21609'],
          ['Xã An Nghĩa', '21622'],
          ['Xã An Quang', '21628'],
          ['Xã An Tân', '21609'],
          ['Xã An Toàn', '21622'],
          ['Xã An Trung', '21616'],
          ['Xã An Vinh', '21616']
        ]
      },
      {
        oldDistrict: 'Huyện Hoài Ân',
        wards: [
          ['Thị trấn Tăng Bạt Hổ', '21688'],
          ['Xã Ân Đức', '21688'],
          ['Xã Ân Hảo Đông', '21697'],
          ['Xã Ân Hảo Tây', '21697'],
          ['Xã Ân Hữu', '21715'],
          ['Xã Ân Mỹ', '21697'],
          ['Xã Ân Nghĩa', '21727'],
          ['Xã Ân Phong', '21688'],
          ['Xã Ân Sơn', '21703'],
          ['Xã Ân Thạnh', '21703'],
          ['Xã Ân Tín', '21703'],
          ['Xã Ân Tường Đông', '21688'],
          ['Xã Ân Tường Tây', '21715'],
          ['Xã Bok Tới', '21727'],
          ['Xã Đak Mang', '21715']
        ]
      },
      {
        oldDistrict: 'Huyện Phù Cát',
        wards: [
          ['Thị trấn Cát Khánh', '21859'],
          ['Thị trấn Cát Tiến', '21880'],
          ['Thị trấn Ngô Mây', '21853'],
          ['Xã Cát Chánh', '21901'],
          ['Xã Cát Hải', '21880'],
          ['Xã Cát Hanh', '21871'],
          ['Xã Cát Hiệp', '21871'],
          ['Xã Cát Hưng', '21901'],
          ['Xã Cát Lâm', '21868'],
          ['Xã Cát Minh', '21859'],
          ['Xã Cát Nhơn', '21892'],
          ['Xã Cát Sơn', '21868'],
          ['Xã Cát Tài', '21859'],
          ['Xã Cát Tân', '21853'],
          ['Xã Cát Thành', '21880'],
          ['Xã Cát Thắng', '21901'],
          ['Xã Cát Trinh', '21853'],
          ['Xã Cát Tường', '21892']
        ]
      },
      {
        oldDistrict: 'Huyện Phù Mỹ',
        wards: [
          ['Thị trấn Bình Dương', '21733'],
          ['Thị trấn Phù Mỹ', '21730'],
          ['Xã Mỹ An', '21751'],
          ['Xã Mỹ Cát', '21769'],
          ['Xã Mỹ Chánh', '21769'],
          ['Xã Mỹ Chánh Tây', '21730'],
          ['Xã Mỹ Châu', '21739'],
          ['Xã Mỹ Đức', '21739'],
          ['Xã Mỹ Hiệp', '21775'],
          ['Xã Mỹ Hòa', '21757'],
          ['Xã Mỹ Lộc', '21739'],
          ['Xã Mỹ Lợi', '21733'],
          ['Xã Mỹ Phong', '21733'],
          ['Xã Mỹ Quang', '21730'],
          ['Xã Mỹ Tài', '21775'],
          ['Xã Mỹ Thành', '21769'],
          ['Xã Mỹ Thắng', '21751'],
          ['Xã Mỹ Thọ', '21751'],
          ['Xã Mỹ Trinh', '21757']
        ]
      },
      {
        oldDistrict: 'Huyện Tây Sơn',
        wards: [
          ['Thị trấn Phú Phong', '21808'],
          ['Xã Bình Hòa', '21829'],
          ['Xã Bình Nghi', '21808'],
          ['Xã Bình Tân', '21817'],
          ['Xã Bình Thành', '21829'],
          ['Xã Bình Thuận', '21817'],
          ['Xã Bình Tường', '21835'],
          ['Xã Tây An', '21817'],
          ['Xã Tây Bình', '21829'],
          ['Xã Tây Giang', '21820'],
          ['Xã Tây Phú', '21835'],
          ['Xã Tây Thuận', '21820'],
          ['Xã Tây Vinh', '21829'],
          ['Xã Tây Xuân', '21808'],
          ['Xã Vĩnh An', '21835']
        ]
      },
      {
        oldDistrict: 'Huyện Tuy Phước',
        wards: [
          ['Thị trấn Diêu Trì', '21952'],
          ['Thị trấn Tuy Phước', '21952'],
          ['Xã Phước An', '21985'],
          ['Xã Phước Hiệp', '21964'],
          ['Xã Phước Hòa', '21970'],
          ['Xã Phước Hưng', '21964'],
          ['Xã Phước Lộc', '21952'],
          ['Xã Phước Nghĩa', '21952'],
          ['Xã Phước Quang', '21964'],
          ['Xã Phước Sơn', '21970'],
          ['Xã Phước Thành', '21985'],
          ['Xã Phước Thắng', '21970'],
          ['Xã Phước Thuận', '21952']
        ]
      },
      {
        oldDistrict: 'Huyện Vân Canh',
        wards: [
          ['Thị trấn Vân Canh', '21994'],
          ['Xã Canh Hiển', '22006'],
          ['Xã Canh Hiệp', '22006'],
          ['Xã Canh Hòa', '21994'],
          ['Xã Canh Liên', '21997'],
          ['Xã Canh Thuận', '21994'],
          ['Xã Canh Vinh', '22006']
        ]
      },
      {
        oldDistrict: 'Huyện Vĩnh Thạnh',
        wards: [
          ['Thị trấn Vĩnh Thạnh', '21786'],
          ['Xã Vĩnh Hảo', '21786'],
          ['Xã Vĩnh Hiệp', '21796'],
          ['Xã Vĩnh Hòa', '21805'],
          ['Xã Vĩnh Kim', '21787'],
          ['Xã Vĩnh Quang', '21805'],
          ['Xã Vĩnh Sơn', '21787'],
          ['Xã Vĩnh Thịnh', '21796'],
          ['Xã Vĩnh Thuận', '21805']
        ]
      },
      {
        oldDistrict: 'Thành phố Quy Nhơn',
        wards: [
          ['Phường Bùi Thị Xuân', '21589'],
          ['Phường Đống Đa', '21583'],
          ['Phường Ghềnh Ráng', '21592'],
          ['Phường Hải Cảng', '21583'],
          ['Phường Ngô Mây', '21592'],
          ['Phường Nguyễn Văn Cừ', '21592'],
          ['Phường Nhơn Bình', '21601'],
          ['Phường Nhơn Phú', '21553'],
          ['Phường Quang Trung', '21592'],
          ['Phường Thị Nại', '21583'],
          ['Phường Trần Phú', '21583'],
          ['Phường Trần Quang Diệu', '21553'],
          ['Xã Nhơn Châu', '21607'],
          ['Xã Nhơn Hải', '21601'],
          ['Xã Nhơn Hội', '21601'],
          ['Xã Nhơn Lý', '21601'],
          ['Xã Phước Mỹ', '21589']
        ]
      },
      {
        oldDistrict: 'Thị xã An Nhơn',
        wards: [
          ['Phường Bình Định', '21907'],
          ['Phường Đập Đá', '21910'],
          ['Phường Nhơn Hoà', '21943'],
          ['Phường Nhơn Hưng', '21934'],
          ['Phường Nhơn Thành', '21925'],
          ['Xã Nhơn An', '21934'],
          ['Xã Nhơn Hạnh', '21925'],
          ['Xã Nhơn Hậu', '21910'],
          ['Xã Nhơn Khánh', '21907'],
          ['Xã Nhơn Lộc', '21940'],
          ['Xã Nhơn Mỹ', '21910'],
          ['Xã Nhơn Phong', '21925'],
          ['Xã Nhơn Phúc', '21907'],
          ['Xã Nhơn Tân', '21940'],
          ['Xã Nhơn Thọ', '21943']
        ]
      },
      {
        oldDistrict: 'Thị xã Hoài Nhơn',
        wards: [
          ['Phường Bồng Sơn', '21640'],
          ['Phường Hoài Đức', '21640'],
          ['Phường Hoài Hảo', '21661'],
          ['Phường Hoài Hương', '21670'],
          ['Phường Hoài Tân', '21673'],
          ['Phường Hoài Thanh', '21664'],
          ['Phường Hoài Thanh Tây', '21664'],
          ['Phường Hoài Xuân', '21673'],
          ['Phường Tam Quan', '21637'],
          ['Phường Tam Quan Bắc', '21655'],
          ['Phường Tam Quan Nam', '21664'],
          ['Xã Hoài Châu', '21637'],
          ['Xã Hoài Châu Bắc', '21655'],
          ['Xã Hoài Hải', '21670'],
          ['Xã Hoài Mỹ', '21670'],
          ['Xã Hoài Phú', '21661'],
          ['Xã Hoài Sơn', '21655']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Bình Phước',
    districts: [
      {
        oldDistrict: 'Huyện Bù Đăng',
        wards: [
          ['Thị trấn Đức Phong', '25396'],
          ['Xã Bình Minh', '25405'],
          ['Xã Bom Bo', '25405'],
          ['Xã Đak Nhau', '25399'],
          ['Xã Đăng Hà', '25420'],
          ['Xã Đoàn Kết', '25396'],
          ['Xã Đồng Nai', '25402'],
          ['Xã Đức Liễu', '25417'],
          ['Xã Đường 10', '25399'],
          ['Xã Minh Hưng', '25396'],
          ['Xã Nghĩa Bình', '25417'],
          ['Xã Nghĩa Trung', '25417'],
          ['Xã Phú Sơn', '25402'],
          ['Xã Phước Sơn', '25420'],
          ['Xã Thọ Sơn', '25402'],
          ['Xã Thống Nhất', '25420']
        ]
      },
      {
        oldDistrict: 'Huyện Bù Đốp',
        wards: [
          ['Thị trấn Thanh Bình', '25308'],
          ['Xã Hưng Phước', '25309'],
          ['Xã Phước Thiện', '25309'],
          ['Xã Tân Thành', '25318'],
          ['Xã Tân Tiến', '25318'],
          ['Xã Thanh Hòa', '25308'],
          ['Xã Thiện Hưng', '25308']
        ]
      },
      {
        oldDistrict: 'Huyện Bù Gia Mập',
        wards: [
          ['Xã Bình Thắng', '25231'],
          ['Xã Bù Gia Mập', '25222'],
          ['Xã Đa Kia', '25231'],
          ['Xã Đak Ơ', '25225'],
          ['Xã Đức Hạnh', '25267'],
          ['Xã Phú Nghĩa', '25267'],
          ['Xã Phú Văn', '25267'],
          ['Xã Phước Minh', '25231']
        ]
      },
      {
        oldDistrict: 'Huyện Đồng Phú',
        wards: [
          ['Thị trấn Tân Phú', '25363'],
          ['Xã Đồng Tâm', '25390'],
          ['Xã Đồng Tiến', '25390'],
          ['Xã Tân Hòa', '25378'],
          ['Xã Tân Hưng', '25378'],
          ['Xã Tân Lập', '25363'],
          ['Xã Tân Lợi', '25378'],
          ['Xã Tân Phước', '25390'],
          ['Xã Tân Tiến', '25363'],
          ['Xã Thuận Lợi', '25387'],
          ['Xã Thuận Phú', '25387']
        ]
      },
      {
        oldDistrict: 'Huyện Hớn Quản',
        wards: [
          ['Thị trấn Tân Khai', '25357'],
          ['Xã An Khương', '25345'],
          ['Xã An Phú', '25349'],
          ['Xã Đồng Nơ', '25357'],
          ['Xã Minh Đức', '25349'],
          ['Xã Minh Tâm', '25349'],
          ['Xã Phước An', '25351'],
          ['Xã Tân Hiệp', '25357'],
          ['Xã Tân Hưng', '25345'],
          ['Xã Tân Lợi', '25351'],
          ['Xã Tân Quan', '25351'],
          ['Xã Thanh An', '25345'],
          ['Xã Thanh Bình', '25326']
        ]
      },
      {
        oldDistrict: 'Huyện Lộc Ninh',
        wards: [
          ['Thị trấn Lộc Ninh', '25270'],
          ['Xã Lộc An', '25318'],
          ['Xã Lộc Điền', '25303'],
          ['Xã Lộc Hiệp', '25292'],
          ['Xã Lộc Hòa', '25280'],
          ['Xã Lộc Hưng', '25303'],
          ['Xã Lộc Khánh', '25303'],
          ['Xã Lộc Phú', '25292'],
          ['Xã Lộc Quang', '25292'],
          ['Xã Lộc Tấn', '25279'],
          ['Xã Lộc Thái', '25270'],
          ['Xã Lộc Thành', '25294'],
          ['Xã Lộc Thạnh', '25280'],
          ['Xã Lộc Thiện', '25279'],
          ['Xã Lộc Thịnh', '25294'],
          ['Xã Lộc Thuận', '25270']
        ]
      },
      {
        oldDistrict: 'Huyện Phú Riềng',
        wards: [
          ['Xã Bình Sơn', '25220'],
          ['Xã Bình Tân', '25246'],
          ['Xã Bù Nho', '25252'],
          ['Xã Long Bình', '25246'],
          ['Xã Long Hà', '25255'],
          ['Xã Long Hưng', '25246'],
          ['Xã Long Tân', '25255'],
          ['Xã Phú Riềng', '25252'],
          ['Xã Phú Trung', '25261'],
          ['Xã Phước Tân', '25261']
        ]
      },
      {
        oldDistrict: 'Thành phố Đồng Xoài',
        wards: [
          ['Phường Tân Bình', '25195'],
          ['Phường Tân Đồng', '25195'],
          ['Phường Tân Phú', '25195'],
          ['Phường Tân Thiện', '25195'],
          ['Phường Tân Xuân', '25195'],
          ['Phường Tiến Thành', '25210'],
          ['Xã Tân Thành', '25210'],
          ['Xã Tiến Hưng', '25195']
        ]
      },
      {
        oldDistrict: 'Thị xã Bình Long',
        wards: [
          ['Phường An Lộc', '25326'],
          ['Phường Hưng Chiến', '25326'],
          ['Phường Phú Đức', '25326'],
          ['Phường Phú Thịnh', '25333'],
          ['Xã Thanh Lương', '25333'],
          ['Xã Thanh Phú', '25333']
        ]
      },
      {
        oldDistrict: 'Thị xã Chơn Thành',
        wards: [
          ['Phường Hưng Long', '25432'],
          ['Phường Minh Hưng', '25441'],
          ['Phường Minh Long', '25441'],
          ['Phường Minh Thành', '25432'],
          ['Phường Thành Tâm', '25432'],
          ['Xã Minh Lập', '25450'],
          ['Xã Minh Thắng', '25450'],
          ['Xã Nha Bích', '25450'],
          ['Xã Quang Minh', '25351']
        ]
      },
      {
        oldDistrict: 'Thị xã Phước Long',
        wards: [
          ['Phường Long Phước', '25220'],
          ['Phường Long Thủy', '25217'],
          ['Phường Phước Bình', '25220'],
          ['Phường Sơn Giang', '25217'],
          ['Phường Thác Mơ', '25217'],
          ['Xã Long Giang', '25220'],
          ['Xã Phước Tín', '25217']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Bình Thuận',
    districts: [
      {
        oldDistrict: 'Huyện Bắc Bình',
        wards: [
          ['Thị trấn Chợ Lầu', '23005'],
          ['Thị trấn Lương Sơn', '23032'],
          ['Xã Bình An', '23020'],
          ['Xã Bình Tân', '23023'],
          ['Xã Hải Ninh', '23020'],
          ['Xã Hòa Thắng', '23053'],
          ['Xã Hồng Phong', '23053'],
          ['Xã Hồng Thái', '23041'],
          ['Xã Phan Điền', '23020'],
          ['Xã Phan Hiệp', '23005'],
          ['Xã Phan Hòa', '23005'],
          ['Xã Phan Lâm', '23008'],
          ['Xã Phan Rí Thành', '23005'],
          ['Xã Phan Sơn', '23008'],
          ['Xã Phan Thanh', '23041'],
          ['Xã Phan Tiến', '23023'],
          ['Xã Sông Bình', '23032'],
          ['Xã Sông Lũy', '23023']
        ]
      },
      {
        oldDistrict: 'Huyện Đức Linh',
        wards: [
          ['Thị trấn Đức Tài', '23194'],
          ['Thị trấn Võ Xu', '23191'],
          ['Xã Đa Kai', '23200'],
          ['Xã Đông Hà', '23227'],
          ['Xã Đức Hạnh', '23194'],
          ['Xã Đức Tín', '23194'],
          ['Xã Mê Pu', '23200'],
          ['Xã Nam Chính', '23191'],
          ['Xã Sùng Nhơn', '23200'],
          ['Xã Tân Hà', '23227'],
          ['Xã Trà Tân', '23227'],
          ['Xã Vũ Hoà', '23191']
        ]
      },
      {
        oldDistrict: 'Huyện Hàm Tân',
        wards: [
          ['Thị trấn Tân Minh', '23230'],
          ['Thị trấn Tân Nghĩa', '23236'],
          ['Xã Sông Phan', '23134'],
          ['Xã Sơn Mỹ', '23266'],
          ['Xã Tân Đức', '23230'],
          ['Xã Tân Hà', '23236'],
          ['Xã Tân Phúc', '23230'],
          ['Xã Tân Thắng', '23266'],
          ['Xã Tân Xuân', '23236'],
          ['Xã Thắng Hải', '23266']
        ]
      },
      {
        oldDistrict: 'Huyện Hàm Thuận Bắc',
        wards: [
          ['Thị trấn Ma Lâm', '23059'],
          ['Thị trấn Phú Long', '22933'],
          ['Xã Đa Mi', '23065'],
          ['Xã Đông Giang', '23074'],
          ['Xã Đông Tiến', '23074'],
          ['Xã Hàm Chính', '23095'],
          ['Xã Hàm Đức', '23059'],
          ['Xã Hàm Hiệp', '22960'],
          ['Xã Hàm Liêm', '23095'],
          ['Xã Hàm Phú', '23089'],
          ['Xã Hàm Thắng', '22933'],
          ['Xã Hàm Trí', '23089'],
          ['Xã Hồng Liêm', '23086'],
          ['Xã Hồng Sơn', '23086'],
          ['Xã La Dạ', '23065'],
          ['Xã Thuận Hòa', '23089'],
          ['Xã Thuận Minh', '23059']
        ]
      },
      {
        oldDistrict: 'Huyện Hàm Thuận Nam',
        wards: [
          ['Thị trấn Thuận Nam', '23110'],
          ['Xã Hàm Cần', '23122'],
          ['Xã Hàm Cường', '23128'],
          ['Xã Hàm Kiệm', '23128'],
          ['Xã Hàm Minh', '23110'],
          ['Xã Hàm Mỹ', '22963'],
          ['Xã Hàm Thạnh', '23122'],
          ['Xã Mương Mán', '23128'],
          ['Xã Mỹ Thạnh', '23122'],
          ['Xã Tân Lập', '23134'],
          ['Xã Tân Thành', '23143'],
          ['Xã Tân Thuận', '23143'],
          ['Xã Thuận Quí', '23143']
        ]
      },
      {
        oldDistrict: 'Huyện Phú Quí',
        wards: [
          ['Xã Long Hải', '23272'],
          ['Xã Ngũ Phụng', '23272'],
          ['Xã Tam Thanh', '23272']
        ]
      },
      {
        oldDistrict: 'Huyện Tánh Linh',
        wards: [
          ['Thị trấn Lạc Tánh', '23149'],
          ['Xã Bắc Ruộng', '23152'],
          ['Xã Đồng Kho', '23173'],
          ['Xã Đức Bình', '23173'],
          ['Xã Đức Phú', '23158'],
          ['Xã Đức Thuận', '23149'],
          ['Xã Gia An', '23149'],
          ['Xã Gia Huynh', '23188'],
          ['Xã Huy Khiêm', '23173'],
          ['Xã La Ngâu', '23173'],
          ['Xã Măng Tố', '23152'],
          ['Xã Nghị Đức', '23158'],
          ['Xã Suối Kiết', '23188']
        ]
      },
      {
        oldDistrict: 'Huyện Tuy Phong',
        wards: [
          ['Thị trấn Liên Hương', '22969'],
          ['Thị trấn Phan Rí Cửa', '22972'],
          ['Xã Bình Thạnh', '22969'],
          ['Xã Chí Công', '22972'],
          ['Xã Hòa Minh', '22972'],
          ['Xã Phan Dũng', '22978'],
          ['Xã Phong Phú', '22978'],
          ['Xã Phú Lạc', '22969'],
          ['Xã Phước Thể', '22969'],
          ['Xã Vĩnh Hảo', '22981'],
          ['Xã Vĩnh Tân', '22981']
        ]
      },
      {
        oldDistrict: 'Thành phố Phan Thiết',
        wards: [
          ['Phường Bình Hưng', '22945'],
          ['Phường Đức Long', '22954'],
          ['Phường Hàm Tiến', '22918'],
          ['Phường Lạc Đạo', '22945'],
          ['Phường Mũi Né', '22918'],
          ['Phường Phú Hài', '22924'],
          ['Phường Phú Tài', '22960'],
          ['Phường Phú Thủy', '22924'],
          ['Phường Phú Trinh', '22945'],
          ['Phường Thanh Hải', '22924'],
          ['Phường Xuân An', '22933'],
          ['Xã Phong Nẫm', '22960'],
          ['Xã Thiện Nghiệp', '22918'],
          ['Xã Tiến Lợi', '22963'],
          ['Xã Tiến Thành', '22954']
        ]
      },
      {
        oldDistrict: 'Thị xã La Gi',
        wards: [
          ['Phường Bình Tân', '23235'],
          ['Phường Phước Hội', '23231'],
          ['Phường Phước Lộc', '23231'],
          ['Phường Tân An', '23235'],
          ['Phường Tân Thiện', '23235'],
          ['Xã Tân Bình', '23235'],
          ['Xã Tân Hải', '23246'],
          ['Xã Tân Phước', '23231'],
          ['Xã Tân Tiến', '23246']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Cà Mau',
    districts: [
      {
        oldDistrict: 'Huyện Cái Nước',
        wards: [
          ['Thị trấn Cái Nước', '32128'],
          ['Xã Đông Hưng', '32137'],
          ['Xã Đông Thới', '32128'],
          ['Xã Hoà Mỹ', '32140'],
          ['Xã Hưng Mỹ', '32140'],
          ['Xã Lương Thế Trân', '32134'],
          ['Xã Phú Hưng', '32134'],
          ['Xã Tân Hưng', '32137'],
          ['Xã Tân Hưng Đông', '32140'],
          ['Xã Thạnh Phú', '32134'],
          ['Xã Trần Thới', '32128']
        ]
      },
      {
        oldDistrict: 'Huyện Đầm Dơi',
        wards: [
          ['Thị trấn Đầm Dơi', '32152'],
          ['Xã Ngọc Chánh', '32185'],
          ['Xã Nguyễn Huân', '32188'],
          ['Xã Quách Phẩm', '32182'],
          ['Xã Quách Phẩm Bắc', '32182'],
          ['Xã Tạ An Khương', '32155'],
          ['Xã Tạ An Khương Đông', '32155'],
          ['Xã Tạ An Khương Nam', '32155'],
          ['Xã Tân Dân', '32152'],
          ['Xã Tân Duyệt', '32152'],
          ['Xã Tân Đức', '32167'],
          ['Xã Tân Thuận', '32167'],
          ['Xã Tân Tiến', '32188'],
          ['Xã Tân Trung', '32161'],
          ['Xã Thanh Tùng', '32185'],
          ['Xã Trần Phán', '32161']
        ]
      },
      {
        oldDistrict: 'Huyện Năm Căn',
        wards: [
          ['Thị trấn Năm Căn', '32191'],
          ['Xã Đất Mới', '32201'],
          ['Xã Hàm Rồng', '32191'],
          ['Xã Hàng Vịnh', '32191'],
          ['Xã Hiệp Tùng', '32206'],
          ['Xã Lâm Hải', '32201'],
          ['Xã Tam Giang', '32206'],
          ['Xã Tam Giang Đông', '32206']
        ]
      },
      {
        oldDistrict: 'Huyện Ngọc Hiển',
        wards: [
          ['Thị trấn Rạch Gốc', '32244'],
          ['Xã Đất Mũi', '32248'],
          ['Xã Tam Giang Tây', '32236'],
          ['Xã Tân Ân', '32244'],
          ['Xã Tân Ân Tây', '32236'],
          ['Xã Viên An', '32248'],
          ['Xã Viên An Đông', '32244']
        ]
      },
      {
        oldDistrict: 'Huyện Phú Tân',
        wards: [
          ['Thị trấn Cái Đôi Vàm', '32212'],
          ['Xã Nguyễn Việt Khái', '32212'],
          ['Xã Phú Mỹ', '32214'],
          ['Xã Phú Tân', '32218'],
          ['Xã Phú Thuận', '32214'],
          ['Xã Rạch Chèo', '32227'],
          ['Xã Tân Hải', '32218'],
          ['Xã Tân Hưng Tây', '32227'],
          ['Xã Việt Thắng', '32227']
        ]
      },
      {
        oldDistrict: 'Huyện Thới Bình',
        wards: [
          ['Thị trấn Thới Bình', '32065'],
          ['Xã Biển Bạch', '32069'],
          ['Xã Biển Bạch Đông', '32069'],
          ['Xã Hồ Thị Kỷ', '32092'],
          ['Xã Tân Bằng', '32069'],
          ['Xã Tân Lộc', '32083'],
          ['Xã Tân Lộc Bắc', '32083'],
          ['Xã Tân Lộc Đông', '32083'],
          ['Xã Tân Phú', '32071'],
          ['Xã Thới Bình', '32065'],
          ['Xã Trí Lực', '32071'],
          ['Xã Trí Phải', '32071']
        ]
      },
      {
        oldDistrict: 'Huyện Trần Văn Thời',
        wards: [
          ['Thị trấn Sông Đốc', '32098'],
          ['Thị trấn Trần Văn Thời', '32095'],
          ['Xã Khánh Bình', '32110'],
          ['Xã Khánh Bình Đông', '32110'],
          ['Xã Khánh Bình Tây', '32104'],
          ['Xã Khánh Bình Tây Bắc', '32104'],
          ['Xã Khánh Hải', '32119'],
          ['Xã Khánh Hưng', '32119'],
          ['Xã Khánh Lộc', '32095'],
          ['Xã Lợi An', '32134'],
          ['Xã Phong Điền', '32098'],
          ['Xã Phong Lạc', '32095'],
          ['Xã Trần Hợi', '32095']
        ]
      },
      {
        oldDistrict: 'Huyện U Minh',
        wards: [
          ['Thị trấn U Minh', '32044'],
          ['Xã Khánh An', '32059'],
          ['Xã Khánh Hòa', '32047'],
          ['Xã Khánh Hội', '32062'],
          ['Xã Khánh Lâm', '32062'],
          ['Xã Khánh Thuận', '32044'],
          ['Xã Khánh Tiến', '32047'],
          ['Xã Nguyễn Phích', '32044']
        ]
      },
      {
        oldDistrict: 'Thành phố Cà Mau',
        wards: [
          ['Phường 1', '32002'],
          ['Phường 2', '32002'],
          ['Phường 5', '32025'],
          ['Phường 6', '32025'],
          ['Phường 7', '32041'],
          ['Phường 8', '32014'],
          ['Phường 9', '32002'],
          ['Phường Tân Thành', '32025'],
          ['Phường Tân Xuyên', '32002'],
          ['Xã An Xuyên', '32002'],
          ['Xã Định Bình', '32041'],
          ['Xã Hòa Tân', '32041'],
          ['Xã Hòa Thành', '32041'],
          ['Xã Lý Văn Lâm', '32014'],
          ['Xã Tắc Vân', '32025'],
          ['Xã Tân Thành', '32025']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Cao Bằng',
    districts: [
      {
        oldDistrict: 'Huyện Bảo Lạc',
        wards: [
          ['Thị trấn Bảo Lạc', '01321'],
          ['Xã Bảo Toàn', '01321'],
          ['Xã Cô Ba', '01327'],
          ['Xã Cốc Pàng', '01324'],
          ['Xã Đình Phùng', '01354'],
          ['Xã Hồng An', '01339'],
          ['Xã Hồng Trị', '01321'],
          ['Xã Huy Giáp', '01354'],
          ['Xã Hưng Đạo', '01351'],
          ['Xã Hưng Thịnh', '01351'],
          ['Xã Khánh Xuân', '01336'],
          ['Xã Kim Cúc', '01351'],
          ['Xã Phan Thanh', '01336'],
          ['Xã Sơn Lập', '01360'],
          ['Xã Sơn Lộ', '01360'],
          ['Xã Thượng Hà', '01327'],
          ['Xã Xuân Trường', '01339']
        ]
      },
      {
        oldDistrict: 'Huyện Bảo Lâm',
        wards: [
          ['Thị trấn Pác Miầu', '01290'],
          ['Xã Đức Hạnh', '01324'],
          ['Xã Lý Bôn', '01294'],
          ['Xã Mông Ân', '01290'],
          ['Xã Nam Cao', '01297'],
          ['Xã Nam Quang', '01297'],
          ['Xã Quảng Lâm', '01304'],
          ['Xã Thạch Lâm', '01304'],
          ['Xã Thái Học', '01318'],
          ['Xã Thái Sơn', '01318'],
          ['Xã Vĩnh Phong', '01290'],
          ['Xã Vĩnh Quang', '01294'],
          ['Xã Yên Thổ', '01318']
        ]
      },
      {
        oldDistrict: 'Huyện Hạ Lang',
        wards: [
          ['Thị trấn Thanh Nhật', '01558'],
          ['Xã An Lạc', '01561'],
          ['Xã Cô Ngân', '01561'],
          ['Xã Đồng Loan', '01537'],
          ['Xã Đức Quang', '01552'],
          ['Xã Kim Loan', '01561'],
          ['Xã Lý Quốc', '01537'],
          ['Xã Minh Long', '01537'],
          ['Xã Quang Long', '01552'],
          ['Xã Thắng Lợi', '01552'],
          ['Xã Thị Hoa', '01558'],
          ['Xã Thống Nhất', '01558'],
          ['Xã Vinh Quý', '01561']
        ]
      },
      {
        oldDistrict: 'Huyện Hà Quảng',
        wards: [
          ['Thị trấn Thông Nông', '01363'],
          ['Thị trấn Xuân Hòa', '01392'],
          ['Xã Cải Viên', '01414'],
          ['Xã Cần Nông', '01366'],
          ['Xã Cần Yên', '01366'],
          ['Xã Đa Thông', '01363'],
          ['Xã Hồng Sỹ', '01438'],
          ['Xã Lũng Nặm', '01393'],
          ['Xã Lương Can', '01363'],
          ['Xã Lương Thông', '01366'],
          ['Xã Mã Ba', '01438'],
          ['Xã Ngọc Đào', '01438'],
          ['Xã Ngọc Động', '01387'],
          ['Xã Nội Thôn', '01414'],
          ['Xã Quý Quân', '01392'],
          ['Xã Sóc Hà', '01392'],
          ['Xã Thanh Long', '01387'],
          ['Xã Thượng Thôn', '01393'],
          ['Xã Tổng Cọt', '01414'],
          ['Xã Trường Hà', '01392'],
          ['Xã Yên Sơn', '01387']
        ]
      },
      {
        oldDistrict: 'Huyện Hoà An',
        wards: [
          ['Thị trấn Nước Hai', '01654'],
          ['Xã Bạch Đằng', '01708'],
          ['Xã Bình Dương', '01708'],
          ['Xã Dân Chủ', '01660'],
          ['Xã Đại Tiến', '01654'],
          ['Xã Đức Long', '01660'],
          ['Xã Hoàng Tung', '01273'],
          ['Xã Hồng Nam', '01792'],
          ['Xã Hồng Việt', '01654'],
          ['Xã Lê Chung', '01288'],
          ['Xã Nam Tuấn', '01660'],
          ['Xã Ngũ Lão', '01699'],
          ['Xã Nguyễn Huệ', '01699'],
          ['Xã Quang Trung', '01699'],
          ['Xã Trương Lương', '01747']
        ]
      },
      {
        oldDistrict: 'Huyện Nguyên Bình',
        wards: [
          ['Thị trấn Nguyên Bình', '01726'],
          ['Thị trấn Tĩnh Túc', '01729'],
          ['Xã Ca Thành', '01738'],
          ['Xã Hoa Thám', '01774'],
          ['Xã Hưng Đạo', '01774'],
          ['Xã Mai Long', '01768'],
          ['Xã Minh Tâm', '01747'],
          ['Xã Phan Thanh', '01768'],
          ['Xã Quang Thành', '01777'],
          ['Xã Tam Kim', '01774'],
          ['Xã Thành Công', '01777'],
          ['Xã Thể Dục', '01726'],
          ['Xã Thịnh Vượng', '01708'],
          ['Xã Triệu Nguyên', '01729'],
          ['Xã Vũ Minh', '01726'],
          ['Xã Vũ Nông', '01729'],
          ['Xã Yên Lạc', '01738']
        ]
      },
      {
        oldDistrict: 'Huyện Quảng Hòa',
        wards: [
          ['Thị trấn Hoà Thuận', '01648'],
          ['Thị trấn Quảng Uyên', '01576'],
          ['Thị trấn Tà Lùng', '01648'],
          ['Xã Bế Văn Đàn', '01636'],
          ['Xã Cách Linh', '01636'],
          ['Xã Cai Bộ', '01594'],
          ['Xã Chí Thảo', '01576'],
          ['Xã Đại Sơn', '01648'],
          ['Xã Độc Lập', '01594'],
          ['Xã Hạnh Phúc', '01618'],
          ['Xã Hồng Quang', '01636'],
          ['Xã Mỹ Hưng', '01648'],
          ['Xã Ngọc Động', '01618'],
          ['Xã Phi Hải', '01576'],
          ['Xã Phúc Sen', '01576'],
          ['Xã Quảng Hưng', '01594'],
          ['Xã Quốc Toản', '01447'],
          ['Xã Tiên Thành', '01807'],
          ['Xã Tự Do', '01618']
        ]
      },
      {
        oldDistrict: 'Huyện Thạch An',
        wards: [
          ['Thị trấn Đông Khê', '01786'],
          ['Xã Canh Tân', '01789'],
          ['Xã Đức Long', '01822'],
          ['Xã Đức Thông', '01789'],
          ['Xã Đức Xuân', '01786'],
          ['Xã Kim Đồng', '01792'],
          ['Xã Lê Lai', '01807'],
          ['Xã Lê Lợi', '01822'],
          ['Xã Minh Khai', '01795'],
          ['Xã Quang Trọng', '01795'],
          ['Xã Thái Cường', '01792'],
          ['Xã Thụy Hùng', '01822'],
          ['Xã Trọng Con', '01786'],
          ['Xã Vân Trình', '01807']
        ]
      },
      {
        oldDistrict: 'Huyện Trùng Khánh',
        wards: [
          ['Thị trấn Trà Lĩnh', '01447'],
          ['Thị trấn Trùng Khánh', '01477'],
          ['Xã Cao Chương', '01447'],
          ['Xã Cao Thăng', '01525'],
          ['Xã Chí Viễn', '01501'],
          ['Xã Đàm Thuỷ', '01501'],
          ['Xã Đình Phong', '01489'],
          ['Xã Đoài Dương', '01525'],
          ['Xã Đức Hồng', '01477'],
          ['Xã Khâm Thành', '01477'],
          ['Xã Lăng Hiếu', '01477'],
          ['Xã Ngọc Côn', '01489'],
          ['Xã Ngọc Khê', '01489'],
          ['Xã Phong Châu', '01501'],
          ['Xã Phong Nậm', '01489'],
          ['Xã Quang Hán', '01456'],
          ['Xã Quang Trung', '01465'],
          ['Xã Quang Vinh', '01456'],
          ['Xã Tri Phương', '01465'],
          ['Xã Trung Phúc', '01525'],
          ['Xã Xuân Nội', '01465']
        ]
      },
      {
        oldDistrict: 'Thành phố Cao Bằng',
        wards: [
          ['Phường Duyệt Trung', '01288'],
          ['Phường Đề Thám', '01273'],
          ['Phường Hoà Chung', '01288'],
          ['Phường Hợp Giang', '01273'],
          ['Phường Ngọc Xuân', '01279'],
          ['Phường Sông Bằng', '01279'],
          ['Phường Sông Hiến', '01273'],
          ['Phường Tân Giang', '01288'],
          ['Xã Chu Trinh', '01288'],
          ['Xã Hưng Đạo', '01273'],
          ['Xã Vĩnh Quang', '01279']
        ]
      }
    ]
  },
  {
    oldProvince: 'Thành phố Cần Thơ',
    districts: [
      {
        oldDistrict: 'Huyện Cờ Đỏ',
        wards: [
          ['Thị trấn Cờ Đỏ', '31261'],
          ['Xã Đông Hiệp', '31273'],
          ['Xã Đông Thắng', '31273'],
          ['Xã Thạnh Phú', '31249'],
          ['Xã Thới Đông', '31261'],
          ['Xã Thới Hưng', '31264'],
          ['Xã Thới Xuân', '31261'],
          ['Xã Trung An', '31217'],
          ['Xã Trung Hưng', '31255'],
          ['Xã Trung Thạnh', '31255']
        ]
      },
      {
        oldDistrict: 'Huyện Phong Điền',
        wards: [
          ['Thị trấn Phong Điền', '31299'],
          ['Xã Giai Xuân', '31299'],
          ['Xã Mỹ Khánh', '31150'],
          ['Xã Nhơn Ái', '31315'],
          ['Xã Nhơn Nghĩa', '31315'],
          ['Xã Tân Thới', '31299'],
          ['Xã Trường Long', '31309']
        ]
      },
      {
        oldDistrict: 'Huyện Thới Lai',
        wards: [
          ['Thị trấn Thới Lai', '31258'],
          ['Xã Định Môn', '31288'],
          ['Xã Đông Bình', '31282'],
          ['Xã Đông Thuận', '31282'],
          ['Xã Tân Thạnh', '31288'],
          ['Xã Thới Tân', '31258'],
          ['Xã Thới Thạnh', '31153'],
          ['Xã Trường Thành', '31288'],
          ['Xã Trường Thắng', '31258'],
          ['Xã Trường Xuân', '31294'],
          ['Xã Trường Xuân A', '31294'],
          ['Xã Trường Xuân B', '31294'],
          ['Xã Xuân Thắng', '31273']
        ]
      },
      {
        oldDistrict: 'Huyện Vĩnh Thạnh',
        wards: [
          ['Thị trấn Thanh An', '31231'],
          ['Thị trấn Vĩnh Thạnh', '31232'],
          ['Xã Thạnh An', '31246'],
          ['Xã Thạnh Lộc', '31232'],
          ['Xã Thạnh Lợi', '31231'],
          ['Xã Thạnh Mỹ', '31232'],
          ['Xã Thạnh Qưới', '31246'],
          ['Xã Thạnh Thắng', '31231'],
          ['Xã Thạnh Tiến', '31246'],
          ['Xã Vĩnh Bình', '31237'],
          ['Xã Vĩnh Trinh', '31237']
        ]
      },
      {
        oldDistrict: 'Quận Bình Thuỷ',
        wards: [
          ['Phường An Thới', '31168'],
          ['Phường Bình Thủy', '31168'],
          ['Phường Bùi Hữu Nghĩa', '31168'],
          ['Phường Long Hòa', '31183'],
          ['Phường Long Tuyền', '31183'],
          ['Phường Thới An Đông', '31174'],
          ['Phường Trà An', '31174'],
          ['Phường Trà Nóc', '31174']
        ]
      },
      {
        oldDistrict: 'Quận Cái Răng',
        wards: [
          ['Phường Ba Láng', '31186'],
          ['Phường Hưng Phú', '31201'],
          ['Phường Hưng Thạnh', '31186'],
          ['Phường Lê Bình', '31186'],
          ['Phường Phú Thứ', '31201'],
          ['Phường Tân Phú', '31201'],
          ['Phường Thường Thạnh', '31186']
        ]
      },
      {
        oldDistrict: 'Quận Ninh Kiều',
        wards: [
          ['Phường An Bình', '31150'],
          ['Phường An Hòa', '31120'],
          ['Phường An Khánh', '31147'],
          ['Phường Cái Khế', '31120'],
          ['Phường Hưng Lợi', '31147'],
          ['Phường Tân An', '31135'],
          ['Phường Thới Bình', '31135'],
          ['Phường Xuân Khánh', '31135']
        ]
      },
      {
        oldDistrict: 'Quận Ô Môn',
        wards: [
          ['Phường Châu Văn Liêm', '31153'],
          ['Phường Long Hưng', '31157'],
          ['Phường Phước Thới', '31162'],
          ['Phường Thới An', '31153'],
          ['Phường Thới Hòa', '31153'],
          ['Phường Thới Long', '31157'],
          ['Phường Trường Lạc', '31162']
        ]
      },
      {
        oldDistrict: 'Quận Thốt Nốt',
        wards: [
          ['Phường Tân Hưng', '31157'],
          ['Phường Tân Lộc', '31213'],
          ['Phường Thạnh Hoà', '31217'],
          ['Phường Thốt Nốt', '31207'],
          ['Phường Thới Thuận', '31207'],
          ['Phường Thuận An', '31207'],
          ['Phường Thuận Hưng', '31228'],
          ['Phường Trung Kiên', '31228'],
          ['Phường Trung Nhứt', '31217']
        ]
      }
    ]
  },
  {
    oldProvince: 'Thành phố Đà Nẵng',
    districts: [
      {
        oldDistrict: 'Huyện Hòa Vang',
        wards: [
          ['Xã Hòa Bắc', '20194'],
          ['Xã Hòa Châu', '20314'],
          ['Xã Hòa Khương', '20332'],
          ['Xã Hòa Liên', '20197'],
          ['Xã Hòa Nhơn', '20308'],
          ['Xã Hòa Ninh', '20308'],
          ['Xã Hòa Phong', '20320'],
          ['Xã Hòa Phú', '20320'],
          ['Xã Hòa Phước', '20314'],
          ['Xã Hòa Sơn', '20200'],
          ['Xã Hòa Tiến', '20332']
        ]
      },
      {
        oldDistrict: 'Huyện Hoàng Sa',
        wards: [['Huyện đảo Hoàng Sa (không chia phường/xã)', '20333']]
      },
      {
        oldDistrict: 'Quận Cẩm Lệ',
        wards: [
          ['Phường Hòa An', '20305'],
          ['Phường Hòa Phát', '20305'],
          ['Phường Hòa Thọ Đông', '20260'],
          ['Phường Hòa Thọ Tây', '20260'],
          ['Phường Hòa Xuân', '20314'],
          ['Phường Khuê Trung', '20260']
        ]
      },
      {
        oldDistrict: 'Quận Hải Châu',
        wards: [
          ['Phường Bình Thuận', '20257'],
          ['Phường Hải Châu', '20242'],
          ['Phường Hòa Cường Bắc', '20257'],
          ['Phường Hòa Cường Nam', '20257'],
          ['Phường Hòa Thuận Tây', '20257'],
          ['Phường Phước Ninh', '20242'],
          ['Phường Thạch Thang', '20242'],
          ['Phường Thanh Bình', '20242'],
          ['Phường Thuận Phước', '20242']
        ]
      },
      {
        oldDistrict: 'Quận Liên Chiểu',
        wards: [
          ['Phường Hòa Hiệp Bắc', '20194'],
          ['Phường Hòa Hiệp Nam', '20194'],
          ['Phường Hòa Khánh Bắc', '20197'],
          ['Phường Hòa Khánh Nam', '20200'],
          ['Phường Hòa Minh', '20200']
        ]
      },
      {
        oldDistrict: 'Quận Ngũ Hành Sơn',
        wards: [
          ['Phường Hoà Hải', '20285'],
          ['Phường Hoà Quý', '20285'],
          ['Phường Khuê Mỹ', '20285'],
          ['Phường Mỹ An', '20285']
        ]
      },
      {
        oldDistrict: 'Quận Sơn Trà',
        wards: [
          ['Phường An Hải Bắc', '20275'],
          ['Phường An Hải Nam', '20275'],
          ['Phường Mân Thái', '20263'],
          ['Phường Nại Hiên Đông', '20263'],
          ['Phường Phước Mỹ', '20275'],
          ['Phường Thọ Quang', '20263']
        ]
      },
      {
        oldDistrict: 'Quận Thanh Khê',
        wards: [
          ['Phường An Khê', '20305'],
          ['Phường Chính Gián', '20209'],
          ['Phường Thạc Gián', '20209'],
          ['Phường Thanh Khê Đông', '20209'],
          ['Phường Thanh Khê Tây', '20209'],
          ['Phường Xuân Hà', '20209']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Đắk Lắk',
    districts: [
      {
        oldDistrict: 'Huyện Buôn Đôn',
        wards: [
          ['Xã Cuôr KNia', '24250'],
          ['Xã Ea Bar', '24250'],
          ['Xã Ea Huar', '24241'],
          ['Xã Ea Nuôl', '24250'],
          ['Xã Ea Wer', '24241'],
          ['Xã Krông Na', '24235'],
          ['Xã Tân Hoà', '24241']
        ]
      },
      {
        oldDistrict: 'Huyện Cư Kuin',
        wards: [
          ['Xã Cư Ê Wi', '24540'],
          ['Xã Dray Bhăng', '24561'],
          ['Xã Ea BHốk', '24561'],
          ['Xã Ea Hu', '24540'],
          ['Xã Ea Ktur', '24544'],
          ['Xã Ea Ning', '24540'],
          ['Xã Ea Tiêu', '24544'],
          ['Xã Hòa Hiệp', '24561']
        ]
      },
      {
        oldDistrict: "Huyện Cư M'gar",
        wards: [
          ['Thị trấn Ea Pốk', '24259'],
          ['Thị trấn Quảng Phú', '24259'],
          ['Xã Cuor Đăng', '24301'],
          ["Xã Cư Dliê M'nông", '24277'],
          ["Xã Cư M'gar", '24280'],
          ['Xã Cư Suê', '24259'],
          ["Xã Ea D'Rơng", '24301'],
          ["Xã Ea H'đinh", '24280'],
          ['Xã Ea Kiết', '24265'],
          ['Xã Ea KPam', '24280'],
          ['Xã Ea Kuêh', '24265'],
          ["Xã Ea M'DRóh", '24286'],
          ["Xã Ea M'nang", '24286'],
          ['Xã Ea Tar', '24277'],
          ['Xã Ea Tul', '24277'],
          ['Xã Quảng Hiệp', '24286'],
          ['Xã Quảng Tiến', '24259']
        ]
      },
      {
        oldDistrict: "Huyện Ea H'leo",
        wards: [
          ['Thị trấn Ea Drăng', '24181'],
          ['Xã Cư A Mung', '24193'],
          ['Xã Cư Mốt', '24193'],
          ['Xã Dliê Yang', '24181'],
          ["Xã Ea H'leo", '24184'],
          ['Xã Ea Hiao', '24187'],
          ['Xã Ea Khal', '24208'],
          ['Xã Ea Nam', '24208'],
          ['Xã Ea Ral', '24181'],
          ['Xã Ea Sol', '24187'],
          ['Xã Ea Tir', '24208'],
          ['Xã Ea Wy', '24193']
        ]
      },
      {
        oldDistrict: 'Huyện Ea Kar',
        wards: [
          ['Thị trấn Ea Kar', '24373'],
          ['Thị trấn Ea Knốp', '24376'],
          ['Xã Cư Bông', '24406'],
          ['Xã Cư ELang', '24403'],
          ['Xã Cư Huê', '24373'],
          ['Xã Cư Jang', '24406'],
          ['Xã Cư Ni', '24373'],
          ['Xã Cư Prông', '24400'],
          ['Xã Ea Đar', '24373'],
          ['Xã Ea Kmút', '24373'],
          ['Xã Ea Ô', '24403'],
          ['Xã Ea Păl', '24400'],
          ['Xã Ea Sar', '24376'],
          ['Xã Ea Sô', '24376'],
          ['Xã Ea Tih', '24376'],
          ['Xã Xuân Phú', '24373']
        ]
      },
      {
        oldDistrict: 'Huyện Ea Súp',
        wards: [
          ['Thị trấn Ea Súp', '24211'],
          ['Xã Cư KBang', '24217'],
          ["Xã Cư M'Lan", '24211'],
          ['Xã Ea Bung', '24229'],
          ['Xã Ea Lê', '24211'],
          ['Xã Ea Rốk', '24217'],
          ['Xã Ia JLơi', '24217'],
          ['Xã Ia Lốp', '24214'],
          ['Xã Ia RVê', '24221'],
          ['Xã Ya Tờ Mốt', '24229']
        ]
      },
      {
        oldDistrict: 'Huyện Krông A Na',
        wards: [
          ['Thị trấn Buôn Trấp', '24538'],
          ['Xã Băng A Drênh', '24568'],
          ['Xã Bình Hòa', '24538'],
          ['Xã Dray Sáp', '24559'],
          ['Xã Dur KMăl', '24568'],
          ['Xã Ea Bông', '24559'],
          ['Xã Ea Na', '24559'],
          ['Xã Quảng Điền', '24538']
        ]
      },
      {
        oldDistrict: 'Huyện Krông Bông',
        wards: [
          ['Thị trấn Krông Kmar', '24448'],
          ['Xã Cư Drăm', '24484'],
          ['Xã Cư KTy', '24454'],
          ['Xã Cư Pui', '24478'],
          ['Xã Dang Kang', '24454'],
          ['Xã Ea Trul', '24472'],
          ['Xã Hòa Lễ', '24448'],
          ['Xã Hòa Phong', '24478'],
          ['Xã Hòa Sơn', '24472'],
          ['Xã Hòa Thành', '24454'],
          ['Xã Khuê Ngọc Điền', '24448'],
          ['Xã Yang Mao', '24484'],
          ['Xã Yang Reh', '24472']
        ]
      },
      {
        oldDistrict: 'Huyện Krông Búk',
        wards: [
          ['Thị trấn Pơng Drang', '24316'],
          ['Xã Chư KBô', '24310'],
          ['Xã Cư Né', '24310'],
          ['Xã Cư Pơng', '24313'],
          ['Xã Ea Ngai', '24316'],
          ['Xã Ea Sin', '24313'],
          ['Xã Tân Lập', '24316']
        ]
      },
      {
        oldDistrict: 'Huyện Krông Năng',
        wards: [
          ['Thị trấn Krông Năng', '24343'],
          ['Xã Cư Klông', '24352'],
          ['Xã ĐLiê Ya', '24346'],
          ['Xã Ea Dăh', '24364'],
          ['Xã Ea Hồ', '24343'],
          ['Xã Ea Puk', '24364'],
          ['Xã Ea Tam', '24352'],
          ['Xã Ea Tân', '24346'],
          ['Xã Ea Tóh', '24346'],
          ['Xã Phú Lộc', '24343'],
          ['Xã Phú Xuân', '24364'],
          ['Xã Tam Giang', '24352']
        ]
      },
      {
        oldDistrict: 'Huyện Krông Pắc',
        wards: [
          ['Thị trấn Phước An', '24490'],
          ['Xã Ea Hiu', '24502'],
          ['Xã Ea Kênh', '24505'],
          ['Xã Ea Kly', '24496'],
          ['Xã Ea KNuec', '24505'],
          ['Xã Ea Kuăng', '24502'],
          ['Xã Ea Phê', '24502'],
          ['Xã Ea Uy', '24526'],
          ['Xã Ea Yiêng', '24526'],
          ['Xã Ea Yông', '24490'],
          ['Xã Hòa An', '24490'],
          ['Xã Hòa Đông', '24505'],
          ['Xã Hòa Tiến', '24490'],
          ['Xã KRông Búk', '24496'],
          ['Xã Tân Tiến', '24526'],
          ['Xã Vụ Bổn', '24529']
        ]
      },
      {
        oldDistrict: 'Huyện Lắk',
        wards: [
          ['Thị trấn Liên Sơn', '24580'],
          ['Xã Bông Krang', '24580'],
          ['Xã Buôn Tría', '24595'],
          ['Xã Buôn Triết', '24595'],
          ['Xã Đắk Liêng', '24595'],
          ['Xã Đắk Nuê', '24598'],
          ['Xã Đắk Phơi', '24598'],
          ["Xã Ea R'Bin", '24607'],
          ['Xã Krông Nô', '24604'],
          ['Xã Nam Ka', '24607'],
          ['Xã Yang Tao', '24580']
        ]
      },
      {
        oldDistrict: "Huyện M'Đrắk",
        wards: [
          ["Thị trấn M'Đrắk", '24412'],
          ['Xã Cư K Róa', '24436'],
          ["Xã Cư M'ta", '24436'],
          ['Xã Cư Prao', '24415'],
          ['Xã Cư San', '24444'],
          ["Xã Ea H'MLay", '24433'],
          ['Xã Ea Lai', '24412'],
          ["Xã Ea M' Doal", '24433'],
          ['Xã Ea Pil', '24415'],
          ['Xã Ea Riêng', '24433'],
          ['Xã Ea Trang', '24445'],
          ['Xã Krông Á', '24444'],
          ['Xã Krông Jing', '24412']
        ]
      },
      {
        oldDistrict: 'Thành phố Buôn Ma Thuột',
        wards: [
          ['Phường Ea Tam', '24169'],
          ['Phường Khánh Xuân', '24154'],
          ['Phường Tân An', '24163'],
          ['Phường Tân Hòa', '24121'],
          ['Phường Tân Lập', '24121'],
          ['Phường Tân Lợi', '24133'],
          ['Phường Tân Thành', '24133'],
          ['Phường Tân Tiến', '24133'],
          ['Phường Thành Công', '24133'],
          ['Phường Thành Nhất', '24154'],
          ['Phường Tự An', '24133'],
          ['Xã Cư ÊBur', '24133'],
          ['Xã Ea Kao', '24169'],
          ['Xã Ea Tu', '24163'],
          ['Xã Hòa Khánh', '24175'],
          ['Xã Hòa Phú', '24175'],
          ['Xã Hòa Thắng', '24121'],
          ['Xã Hòa Thuận', '24163'],
          ['Xã Hòa Xuân', '24175']
        ]
      },
      {
        oldDistrict: 'Thị xã Buôn Hồ',
        wards: [
          ['Phường An Bình', '24305'],
          ['Phường An Lạc', '24305'],
          ['Phường Bình Tân', '24340'],
          ['Phường Đạt Hiếu', '24305'],
          ['Phường Đoàn Kết', '24305'],
          ['Phường Thiện An', '24305'],
          ['Phường Thống Nhất', '24305'],
          ['Xã Bình Thuận', '24340'],
          ['Xã Cư Bao', '24340'],
          ['Xã Ea Drông', '24328'],
          ['Xã Ea Siên', '24328']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Đắk Nông',
    districts: [
      {
        oldDistrict: 'Huyện Cư Jút',
        wards: [
          ["Thị trấn Ea T'Ling", '24640'],
          ['Xã Cư Knia', '24640'],
          ['Xã Đắk DRông', '24649'],
          ['Xã Đắk Wil', '24646'],
          ['Xã Ea Pô', '24646'],
          ['Xã Nam Dong', '24649'],
          ['Xã Tâm Thắng', '24640'],
          ['Xã Trúc Sơn', '24640']
        ]
      },
      {
        oldDistrict: 'Huyện Đăk Glong',
        wards: [
          ['Xã Đắk Ha', '24611'],
          ['Xã Đắk Plao', '24631'],
          ["Xã Đắk R'Măng", '24637'],
          ['Xã Đắk Som', '24637'],
          ['Xã Quảng Hoà', '24620'],
          ['Xã Quảng Khê', '24631'],
          ['Xã Quảng Sơn', '24616']
        ]
      },
      {
        oldDistrict: 'Huyện Đắk Mil',
        wards: [
          ['Thị trấn Đắk Mil', '24664'],
          ['Xã Đắk Gằn', '24670'],
          ['Xã Đắk Lao', '24682'],
          ["Xã Đắk N'Drót", '24670'],
          ["Xã Đắk R'La", '24670'],
          ['Xã Đắk Sắk', '24678'],
          ['Xã Đức Mạnh', '24664'],
          ['Xã Đức Minh', '24664'],
          ['Xã Long Sơn', '24678'],
          ['Xã Thuận An', '24682']
        ]
      },
      {
        oldDistrict: "Huyện Đắk R'Lấp",
        wards: [
          ['Thị trấn Kiến Đức', '24733'],
          ['Xã Đạo Nghĩa', '24733'],
          ['Xã Đắk Ru', '24760'],
          ['Xã Đắk Sin', '24760'],
          ['Xã Đắk Wer', '24751'],
          ['Xã Hưng Bình', '24760'],
          ['Xã Kiến Thành', '24733'],
          ['Xã Nghĩa Thắng', '24733'],
          ['Xã Nhân Cơ', '24751'],
          ['Xã Nhân Đạo', '24751'],
          ['Xã Quảng Tín', '24760']
        ]
      },
      {
        oldDistrict: 'Huyện Đắk Song',
        wards: [
          ['Thị trấn Đức An', '24717'],
          ['Xã Đắk Hòa', '24718'],
          ['Xã Đắk Môl', '24718'],
          ["Xã Đắk N'Dung", '24717'],
          ['Xã Nam Bình', '24717'],
          ["Xã Nâm N'Jang", '24730'],
          ['Xã Thuận Hà', '24722'],
          ['Xã Thuận Hạnh', '24722'],
          ['Xã Trường Xuân', '24730']
        ]
      },
      {
        oldDistrict: 'Huyện Krông Nô',
        wards: [
          ['Thị trấn Đắk Mâm', '24688'],
          ['Xã Buôn Choah', '24697'],
          ['Xã Đắk Drô', '24688'],
          ['Xã Đắk Nang', '24712'],
          ['Xã Đắk Sôr', '24697'],
          ['Xã Đức Xuyên', '24712'],
          ['Xã Nam Đà', '24697'],
          ['Xã Nam Xuân', '24678'],
          ["Xã Nâm N'Đir", '24703'],
          ['Xã Nâm Nung', '24703'],
          ['Xã Quảng Phú', '24712'],
          ['Xã Tân Thành', '24688']
        ]
      },
      {
        oldDistrict: 'Huyện Tuy Đức',
        wards: [
          ['Xã Đắk Búk So', '24739'],
          ['Xã Đắk Ngo', '24748'],
          ["Xã Đắk R'Tíh", '24739'],
          ['Xã Quảng Tâm', '24739'],
          ['Xã Quảng Tân', '24748'],
          ['Xã Quảng Trực', '24736']
        ]
      },
      {
        oldDistrict: 'Thành phố Gia Nghĩa',
        wards: [
          ['Phường Nghĩa Đức', '24611'],
          ['Phường Nghĩa Phú', '24615'],
          ['Phường Nghĩa Tân', '24615'],
          ['Phường Nghĩa Thành', '24611'],
          ['Phường Nghĩa Trung', '24617'],
          ['Phường Quảng Thành', '24611'],
          ['Xã Đắk Nia', '24617'],
          ["Xã Đăk R'Moan", '24615']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Điện Biên',
    districts: [
      {
        oldDistrict: 'Huyện Điện Biên',
        wards: [
          ['Xã Hẹ Muông', '03358'],
          ['Xã Hua Thanh', '03328'],
          ['Xã Mường Lói', '03368'],
          ['Xã Mường Nhà', '03368'],
          ['Xã Mường Pồn', '03202'],
          ['Xã Na Tông', '03358'],
          ['Xã Na Ư', '03356'],
          ['Xã Noọng Hẹt', '03352'],
          ['Xã Noong Luống', '03349'],
          ['Xã Núa Ngam', '03358'],
          ['Xã Pa Thơm', '03349'],
          ['Xã Phu Luông', '03368'],
          ['Xã Pom Lót', '03356'],
          ['Xã Sam Mứn', '03352'],
          ['Xã Thanh An', '03352'],
          ['Xã Thanh Chăn', '03328'],
          ['Xã Thanh Hưng', '03328'],
          ['Xã Thanh Luông', '03328'],
          ['Xã Thanh Nưa', '03328'],
          ['Xã Thanh Xương', '03334'],
          ['Xã Thanh Yên', '03349']
        ]
      },
      {
        oldDistrict: 'Huyện Điện Biên Đông',
        wards: [
          ['Thị trấn Điện Biên Đông', '03203'],
          ['Xã Chiềng Sơ', '03214'],
          ['Xã Háng Lìa', '03385'],
          ['Xã Keo Lôm', '03203'],
          ['Xã Luân Giới', '03214'],
          ['Xã Mường Luân', '03214'],
          ['Xã Na Son', '03203'],
          ['Xã Nong U', '03370'],
          ['Xã Phì Nhừ', '03208'],
          ['Xã Phình Giàng', '03382'],
          ['Xã Pú Hồng', '03382'],
          ['Xã Pú Nhi', '03370'],
          ['Xã Tìa Dình', '03385'],
          ['Xã Xa Dung', '03208']
        ]
      },
      {
        oldDistrict: 'Huyện Mường Ảng',
        wards: [
          ['Thị trấn Mường Ảng', '03256'],
          ['Xã Ẳng Cang', '03256'],
          ['Xã Ẳng Nưa', '03256'],
          ['Xã Ẳng Tở', '03301'],
          ['Xã Búng Lao', '03301'],
          ['Xã Mường Đăng', '03316'],
          ['Xã Mường Lạn', '03313'],
          ['Xã Nặm Lịch', '03313'],
          ['Xã Ngối Cáy', '03316'],
          ['Xã Xuân Lao', '03313']
        ]
      },
      {
        oldDistrict: 'Huyện Mường Chà',
        wards: [
          ['Thị trấn Mường Chà', '03172'],
          ['Xã Huổi Lèng', '03181'],
          ['Xã Huổi Mí', '03194'],
          ['Xã Hừa Ngài', '03193'],
          ['Xã Ma Thì Hồ', '03172'],
          ['Xã Mường Mươn', '03202'],
          ['Xã Mường Tùng', '03181'],
          ['Xã Na Sang', '03172'],
          ['Xã Nậm Nèn', '03194'],
          ['Xã Pa Ham', '03193'],
          ['Xã Sa Lông', '03172'],
          ['Xã Xá Tổng', '03151']
        ]
      },
      {
        oldDistrict: 'Huyện Mường Nhé',
        wards: [
          ['Xã Chung Chải', '03160'],
          ['Xã Huổi Lếnh', '03163'],
          ['Xã Leng Su Sìn', '03158'],
          ['Xã Mường Nhé', '03160'],
          ['Xã Mường Toong', '03163'],
          ['Xã Nậm Kè', '03162'],
          ['Xã Nậm Vì', '03160'],
          ['Xã Pá Mỳ', '03162'],
          ['Xã Quảng Lâm', '03164'],
          ['Xã Sen Thượng', '03158'],
          ['Xã Sín Thầu', '03158']
        ]
      },
      {
        oldDistrict: 'Huyện Nậm Pồ',
        wards: [
          ['Xã Chà Cang', '03166'],
          ['Xã Chà Nưa', '03166'],
          ['Xã Chà Tở', '03175'],
          ['Xã Nà Bủng', '03176'],
          ['Xã Na Cô Sa', '03164'],
          ['Xã Nà Hỳ', '03169'],
          ['Xã Nà Khoa', '03169'],
          ['Xã Nậm Chua', '03169'],
          ['Xã Nậm Khăn', '03175'],
          ['Xã Nậm Nhừ', '03169'],
          ['Xã Nậm Tin', '03166'],
          ['Xã Pa Tần', '03166'],
          ['Xã Phìn Hồ', '03199'],
          ['Xã Si Pa Phìn', '03199'],
          ['Xã Vàng Đán', '03176']
        ]
      },
      {
        oldDistrict: 'Huyện Tủa Chùa',
        wards: [
          ['Thị trấn Tủa Chùa', '03217'],
          ['Xã Huổi Só', '03220'],
          ['Xã Lao Xả Phình', '03226'],
          ['Xã Mường Báng', '03217'],
          ['Xã Mường Đun', '03244'],
          ['Xã Sáng Nhè', '03244'],
          ['Xã Sính Phình', '03241'],
          ['Xã Tả Phìn', '03241'],
          ['Xã Tả Sìn Thàng', '03226'],
          ['Xã Trung Thu', '03241'],
          ['Xã Tủa Thàng', '03220'],
          ['Xã Xín Chải', '03226']
        ]
      },
      {
        oldDistrict: 'Huyện Tuần Giáo',
        wards: [
          ['Thị trấn Tuần Giáo', '03253'],
          ['Xã Chiềng Đông', '03301'],
          ['Xã Chiềng Sinh', '03283'],
          ['Xã Mùn Chung', '03268'],
          ['Xã Mường Khong', '03283'],
          ['Xã Mường Mùn', '03268'],
          ['Xã Mường Thín', '03283'],
          ['Xã Nà Sáy', '03283'],
          ['Xã Nà Tòng', '03217'],
          ['Xã Phình Sáng', '03244'],
          ['Xã Pú Nhung', '03260'],
          ['Xã Pú Xi', '03268'],
          ['Xã Quài Cang', '03253'],
          ['Xã Quài Nưa', '03253'],
          ['Xã Quài Tở', '03295'],
          ['Xã Rạng Đông', '03260'],
          ['Xã Ta Ma', '03260'],
          ['Xã Tênh Phông', '03295'],
          ['Xã Tỏa Tình', '03295']
        ]
      },
      {
        oldDistrict: 'Thành phố Điện Biên Phủ',
        wards: [
          ['Phường Him Lam', '03127'],
          ['Phường Mường Thanh', '03127'],
          ['Phường Nam Thanh', '03334'],
          ['Phường Noong Bua', '03334'],
          ['Phường Tân Thanh', '03127'],
          ['Phường Thanh Bình', '03127'],
          ['Phường Thanh Trường', '03127'],
          ['Xã Mường Phăng', '03325'],
          ['Xã Nà Nhạn', '03325'],
          ['Xã Nà Tấu', '03316'],
          ['Xã Pá Khoang', '03325'],
          ['Xã Thanh Minh', '03127']
        ]
      },
      {
        oldDistrict: 'Thị xã Mường Lay',
        wards: [
          ['Phường Na Lay', '03151'],
          ['Phường Sông Đà', '03151'],
          ['Xã Lay Nưa', '03151']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Đồng Nai',
    districts: [
      {
        oldDistrict: 'Huyện Cẩm Mỹ',
        wards: [
          ['Thị trấn Long Giao', '26341'],
          ['Xã Bảo Bình', '26341'],
          ['Xã Lâm San', '26362'],
          ['Xã Nhân Nghĩa', '26341'],
          ['Xã Sông Nhạn', '26332'],
          ['Xã Sông Ray', '26362'],
          ['Xã Thừa Đức', '26347'],
          ['Xã Xuân Bảo', '26461'],
          ['Xã Xuân Đông', '26359'],
          ['Xã Xuân Đường', '26347'],
          ['Xã Xuân Mỹ', '26341'],
          ['Xã Xuân Quế', '26332'],
          ['Xã Xuân Tây', '26359']
        ]
      },
      {
        oldDistrict: 'Huyện Định Quán',
        wards: [
          ['Thị trấn Định Quán', '26206'],
          ['Xã Gia Canh', '26206'],
          ['Xã La Ngà', '26227'],
          ['Xã Ngọc Định', '26206'],
          ['Xã Phú Cường', '26299'],
          ['Xã Phú Hòa', '26221'],
          ['Xã Phú Lợi', '26221'],
          ['Xã Phú Ngọc', '26206'],
          ['Xã Phú Tân', '26215'],
          ['Xã Phú Túc', '26299'],
          ['Xã Phú Vinh', '26215'],
          ['Xã Suối Nho', '26428'],
          ['Xã Thanh Sơn', '26209'],
          ['Xã Túc Trưng', '26227']
        ]
      },
      {
        oldDistrict: 'Huyện Long Thành',
        wards: [
          ['Thị trấn Long Thành', '26368'],
          ['Xã An Phước', '26383'],
          ['Xã Bàu Cạn', '26413'],
          ['Xã Bình An', '26389'],
          ['Xã Bình Sơn', '26368'],
          ['Xã Cẩm Đường', '26347'],
          ['Xã Long An', '26368'],
          ['Xã Long Đức', '26389'],
          ['Xã Long Phước', '26413'],
          ['Xã Lộc An', '26368'],
          ['Xã Phước Bình', '26422'],
          ['Xã Phước Thái', '26422'],
          ['Xã Tam An', '26383'],
          ['Xã Tân Hiệp', '26422']
        ]
      },
      {
        oldDistrict: 'Huyện Nhơn Trạch',
        wards: [
          ['Thị trấn Hiệp Phước', '26485'],
          ['Xã Đại Phước', '26491'],
          ['Xã Long Tân', '26485'],
          ['Xã Long Thọ', '26503'],
          ['Xã Phú Đông', '26491'],
          ['Xã Phú Hội', '26485'],
          ['Xã Phú Hữu', '26491'],
          ['Xã Phú Thạnh', '26485'],
          ['Xã Phước An', '26503'],
          ['Xã Phước Khánh', '26491'],
          ['Xã Phước Thiền', '26485'],
          ['Xã Vĩnh Thanh', '26503']
        ]
      },
      {
        oldDistrict: 'Huyện Tân Phú',
        wards: [
          ['Thị trấn Tân Phú', '26116'],
          ['Xã Dak Lua', '26119'],
          ['Xã Nam Cát Tiên', '26122'],
          ['Xã Phú An', '26122'],
          ['Xã Phú Bình', '26158'],
          ['Xã Phú Điền', '26221'],
          ['Xã Phú Lâm', '26158'],
          ['Xã Phú Lập', '26134'],
          ['Xã Phú Lộc', '26116'],
          ['Xã Phú Sơn', '26158'],
          ['Xã Phú Thanh', '26116'],
          ['Xã Phú Thịnh', '26134'],
          ['Xã Phú Xuân', '26116'],
          ['Xã Tà Lài', '26134'],
          ['Xã Thanh Sơn', '26158'],
          ['Xã Trà Cổ', '26116']
        ]
      },
      {
        oldDistrict: 'Huyện Thống Nhất',
        wards: [
          ['Thị trấn Dầu Giây', '26326'],
          ['Xã Bàu Hàm 2', '26326'],
          ['Xã Gia Kiệm', '26311'],
          ['Xã Gia Tân 1', '26299'],
          ['Xã Gia Tân 2', '26299'],
          ['Xã Gia Tân 3', '26311'],
          ['Xã Hưng Lộc', '26326'],
          ['Xã Lộ 25', '26326'],
          ['Xã Quang Trung', '26311'],
          ['Xã Xuân Thiện', '26089']
        ]
      },
      {
        oldDistrict: 'Huyện Trảng Bom',
        wards: [
          ['Thị trấn Trảng Bom', '26248'],
          ['Xã An Viễn', '26296'],
          ['Xã Bàu Hàm', '26254'],
          ['Xã Bắc Sơn', '26278'],
          ['Xã Bình Minh', '26278'],
          ['Xã Cây Gáo', '26254'],
          ['Xã Đồi 61', '26296'],
          ['Xã Đông Hoà', '26281'],
          ['Xã Giang Điền', '26248'],
          ['Xã Hố Nai 3', '26005'],
          ['Xã Hưng Thịnh', '26281'],
          ['Xã Quảng Tiến', '26248'],
          ['Xã Sông Thao', '26254'],
          ['Xã Sông Trầu', '26248'],
          ['Xã Tây Hoà', '26281'],
          ['Xã Thanh Bình', '26254'],
          ['Xã Trung Hoà', '26281']
        ]
      },
      {
        oldDistrict: 'Huyện Vĩnh Cửu',
        wards: [
          ['Thị trấn Vĩnh An', '26170'],
          ['Xã Bình Lợi', '26188'],
          ['Xã Mã Đà', '26170'],
          ['Xã Phú Lý', '26173'],
          ['Xã Tân An', '26179'],
          ['Xã Tân Bình', '26188'],
          ['Xã Thạnh Phú', '26188'],
          ['Xã Thiện Tân', '25993'],
          ['Xã Trị An', '26170'],
          ['Xã Vĩnh Tân', '26179']
        ]
      },
      {
        oldDistrict: 'Huyện Xuân Lộc',
        wards: [
          ['Thị trấn Gia Ray', '26425'],
          ['Xã Bảo Hoà', '26461'],
          ['Xã Lang Minh', '26458'],
          ['Xã Suối Cao', '26434'],
          ['Xã Suối Cát', '26425'],
          ['Xã Xuân Bắc', '26428'],
          ['Xã Xuân Định', '26461'],
          ['Xã Xuân Hiệp', '26425'],
          ['Xã Xuân Hòa', '26446'],
          ['Xã Xuân Hưng', '26446'],
          ['Xã Xuân Phú', '26458'],
          ['Xã Xuân Tâm', '26446'],
          ['Xã Xuân Thành', '26434'],
          ['Xã Xuân Thọ', '26425'],
          ['Xã Xuân Trường', '26425']
        ]
      },
      {
        oldDistrict: 'Thành phố Biên Hòa',
        wards: [
          ['Phường An Bình', '26041'],
          ['Phường An Hòa', '26380'],
          ['Phường Bình Đa', '26017'],
          ['Phường Bửu Hòa', '26068'],
          ['Phường Bửu Long', '26041'],
          ['Phường Hiệp Hòa', '26041'],
          ['Phường Hóa An', '26068'],
          ['Phường Hố Nai', '26020'],
          ['Phường Long Bình', '26020'],
          ['Phường Long Bình Tân', '26380'],
          ['Phường Phước Tân', '26377'],
          ['Phường Quang Vinh', '26041'],
          ['Phường Tam Hiệp', '26017'],
          ['Phường Tam Phước', '26374'],
          ['Phường Tân Biên', '26020'],
          ['Phường Tân Hạnh', '26068'],
          ['Phường Tân Hiệp', '26017'],
          ['Phường Tân Hòa', '26005'],
          ['Phường Tân Mai', '26017'],
          ['Phường Tân Phong', '26188'],
          ['Phường Tân Vạn', '26068'],
          ['Phường Thống Nhất', '26041'],
          ['Phường Trảng Dài', '25993'],
          ['Phường Trung Dũng', '26041'],
          ['Xã Long Hưng', '26380']
        ]
      },
      {
        oldDistrict: 'Thành phố Long Khánh',
        wards: [
          ['Phường Bảo Vinh', '26098'],
          ['Phường Bàu Sen', '26104'],
          ['Phường Phú Bình', '26080'],
          ['Phường Suối Tre', '26089'],
          ['Phường Xuân An', '26080'],
          ['Phường Xuân Bình', '26080'],
          ['Phường Xuân Hoà', '26080'],
          ['Phường Xuân Lập', '26104'],
          ['Phường Xuân Tân', '26113'],
          ['Xã Bảo Quang', '26098'],
          ['Xã Bàu Trâm', '26080'],
          ['Xã Bình Lộc', '26089'],
          ['Xã Hàng Gòn', '26113']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Đồng Tháp',
    districts: [
      {
        oldDistrict: 'Huyện Cao Lãnh',
        wards: [
          ['Thị trấn Mỹ Thọ', '30076'],
          ['Xã An Bình', '29888'],
          ['Xã Ba Sao', '30085'],
          ['Xã Bình Hàng Tây', '30118'],
          ['Xã Bình Hàng Trung', '30118'],
          ['Xã Bình Thạnh', '30112'],
          ['Xã Gáo Giồng', '30088'],
          ['Xã Mỹ Hiệp', '30112'],
          ['Xã Mỹ Hội', '30076'],
          ['Xã Mỹ Long', '30112'],
          ['Xã Mỹ Thọ', '30076'],
          ['Xã Mỹ Xương', '30076'],
          ['Xã Nhị Mỹ', '29888'],
          ['Xã Phong Mỹ', '30088'],
          ['Xã Phương Thịnh', '30043'],
          ['Xã Phương Trà', '30085'],
          ['Xã Tân Hội Trung', '30118'],
          ['Xã Tân Nghĩa', '29884']
        ]
      },
      {
        oldDistrict: 'Huyện Châu Thành',
        wards: [
          ['Thị trấn Cái Tàu Hạ', '30244'],
          ['Xã An Hiệp', '30244'],
          ['Xã An Khánh', '30253'],
          ['Xã An Nhơn', '30244'],
          ['Xã An Phú Thuận', '30244'],
          ['Xã Hòa Tân', '30253'],
          ['Xã Phú Hựu', '30244'],
          ['Xã Phú Long', '30259'],
          ['Xã Tân Bình', '30259'],
          ['Xã Tân Nhuận Đông', '30253'],
          ['Xã Tân Phú', '30259'],
          ['Xã Tân Phú Trung', '30259']
        ]
      },
      {
        oldDistrict: 'Huyện Hồng Ngự',
        wards: [
          ['Thị trấn Thường Thới Tiền', '29971'],
          ['Xã Long Khánh A', '29983'],
          ['Xã Long Khánh B', '29983'],
          ['Xã Long Thuận', '29992'],
          ['Xã Phú Thuận A', '29992'],
          ['Xã Phú Thuận B', '29992'],
          ['Xã Thường Lạc', '29978'],
          ['Xã Thường Phước 1', '29971'],
          ['Xã Thường Phước 2', '29971'],
          ['Xã Thường Thới Hậu A', '29978']
        ]
      },
      {
        oldDistrict: 'Huyện Lai Vung',
        wards: [
          ['Thị trấn Lai Vung', '30208'],
          ['Xã Định Hòa', '30235'],
          ['Xã Hòa Long', '30208'],
          ['Xã Hòa Thành', '30214'],
          ['Xã Long Hậu', '30208'],
          ['Xã Long Thắng', '30208'],
          ['Xã Phong Hòa', '30235'],
          ['Xã Tân Dương', '30214'],
          ['Xã Tân Hòa', '30235'],
          ['Xã Tân Phước', '30226'],
          ['Xã Tân Thành', '30226'],
          ['Xã Vĩnh Thới', '30235']
        ]
      },
      {
        oldDistrict: 'Huyện Lấp Vò',
        wards: [
          ['Thị trấn Lấp Vò', '30169'],
          ['Xã Bình Thành', '30169'],
          ['Xã Bình Thạnh Trung', '30169'],
          ['Xã Định An', '30226'],
          ['Xã Định Yên', '30226'],
          ['Xã Hội An Đông', '30178'],
          ['Xã Long Hưng A', '30184'],
          ['Xã Long Hưng B', '30184'],
          ['Xã Mỹ An Hưng A', '30178'],
          ['Xã Mỹ An Hưng B', '30178'],
          ['Xã Tân Khánh Trung', '30184'],
          ['Xã Tân Mỹ', '30178'],
          ['Xã Vĩnh Thạnh', '30169']
        ]
      },
      {
        oldDistrict: 'Huyện Tam Nông',
        wards: [
          ['Thị trấn Tràm Chim', '30001'],
          ['Xã An Hòa', '30019'],
          ['Xã An Long', '30028'],
          ['Xã Hoà Bình', '30025'],
          ['Xã Phú Cường', '30025'],
          ['Xã Phú Đức', '30010'],
          ['Xã Phú Hiệp', '30010'],
          ['Xã Phú Ninh', '30028'],
          ['Xã Phú Thành A', '30034'],
          ['Xã Phú Thành B', '30019'],
          ['Xã Phú Thọ', '30034'],
          ['Xã Tân Công Sính', '30001']
        ]
      },
      {
        oldDistrict: 'Huyện Tân Hồng',
        wards: [
          ['Thị trấn Sa Rài', '29926'],
          ['Xã An Phước', '29944'],
          ['Xã Bình Phú', '29926'],
          ['Xã Tân Công Chí', '29926'],
          ['Xã Tân Hộ Cơ', '29929'],
          ['Xã Tân Phước', '29944'],
          ['Xã Tân Thành A', '29938'],
          ['Xã Tân Thành B', '29929'],
          ['Xã Thông Bình', '29938']
        ]
      },
      {
        oldDistrict: 'Huyện Thanh Bình',
        wards: [
          ['Thị trấn Thanh Bình', '30130'],
          ['Xã An Phong', '30028'],
          ['Xã Bình Tấn', '30163'],
          ['Xã Bình Thành', '30163'],
          ['Xã Phú Lợi', '30157'],
          ['Xã Tân Bình', '30154'],
          ['Xã Tân Hòa', '30154'],
          ['Xã Tân Huề', '30154'],
          ['Xã Tân Long', '30154'],
          ['Xã Tân Mỹ', '30130'],
          ['Xã Tân Phú', '30130'],
          ['Xã Tân Quới', '30154'],
          ['Xã Tân Thạnh', '30157']
        ]
      },
      {
        oldDistrict: 'Huyện Tháp Mười',
        wards: [
          ['Thị trấn Mỹ An', '30037'],
          ['Xã Đốc Binh Kiều', '30061'],
          ['Xã Hưng Thạnh', '30043'],
          ['Xã Láng Biển', '30055'],
          ['Xã Mỹ An', '30037'],
          ['Xã Mỹ Đông', '30055'],
          ['Xã Mỹ Hòa', '30037'],
          ['Xã Mỹ Quý', '30055'],
          ['Xã Phú Điền', '30073'],
          ['Xã Tân Kiều', '30061'],
          ['Xã Thạnh Lợi', '30046'],
          ['Xã Thanh Mỹ', '30073'],
          ['Xã Trường Xuân', '30046']
        ]
      },
      {
        oldDistrict: 'Thành phố Cao Lãnh',
        wards: [
          ['Phường 1', '29869'],
          ['Phường 3', '29869'],
          ['Phường 4', '29869'],
          ['Phường 6', '29869'],
          ['Phường Hoà Thuận', '29869'],
          ['Phường Mỹ Ngãi', '29884'],
          ['Phường Mỹ Phú', '29888'],
          ['Xã Hòa An', '29869'],
          ['Xã Mỹ Tân', '29884'],
          ['Xã Mỹ Trà', '29888'],
          ['Xã Tân Thuận Đông', '29869'],
          ['Xã Tân Thuận Tây', '29869'],
          ['Xã Tịnh Thới', '29869']
        ]
      },
      {
        oldDistrict: 'Thành phố Hồng Ngự',
        wards: [
          ['Phường An Bình A', '29954'],
          ['Phường An Bình B', '29954'],
          ['Phường An Lạc', '29978'],
          ['Phường An Lộc', '29954'],
          ['Phường An Thạnh', '29955'],
          ['Xã Bình Thạnh', '29955'],
          ['Xã Tân Hội', '29955']
        ]
      },
      {
        oldDistrict: 'Thành phố Sa Đéc',
        wards: [
          ['Phường 1', '29905'],
          ['Phường 2', '29905'],
          ['Phường 3', '29905'],
          ['Phường 4', '29905'],
          ['Phường An Hoà', '29905'],
          ['Phường Tân Quy Đông', '29905'],
          ['Xã Tân Khánh Đông', '29905'],
          ['Xã Tân Phú Đông', '30214'],
          ['Xã Tân Quy Tây', '29905']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Gia Lai',
    districts: [
      {
        oldDistrict: 'Huyện Chư Păh',
        wards: [
          ['Thị trấn Ia Ly', '23734'],
          ['Thị trấn Phú Hòa', '23722'],
          ['Xã Chư Đăng Ya', '23590'],
          ['Xã Đăk Tơ Ver', '23728'],
          ['Xã Hà Tây', '23728'],
          ['Xã Hòa Phú', '23722'],
          ['Xã Ia Ka', '23749'],
          ['Xã Ia Khươl', '23728'],
          ['Xã Ia Kreng', '23734'],
          ['Xã Ia Mơ Nông', '23734'],
          ['Xã Ia Nhin', '23749'],
          ['Xã Ia Phí', '23749'],
          ['Xã Nghĩa Hòa', '23722'],
          ['Xã Nghĩa Hưng', '23590']
        ]
      },
      {
        oldDistrict: 'Huyện Chư Prông',
        wards: [
          ['Thị trấn Chư Prông', '23887'],
          ['Xã Bàu Cạn', '23896'],
          ['Xã Bình Giáo', '23896'],
          ['Xã Ia Bang', '23908'],
          ['Xã Ia Băng', '23908'],
          ['Xã Ia Boòng', '23911'],
          ['Xã Ia Drăng', '23887'],
          ['Xã Ia Ga', '23926'],
          ['Xã Ia Kly', '23887'],
          ['Xã Ia Lâu', '23935'],
          ['Xã Ia Me', '23911'],
          ['Xã Ia O', '23911'],
          ['Xã Ia Phìn', '23887'],
          ['Xã Ia Pia', '23926'],
          ['Xã Ia Piơr', '23935'],
          ['Xã Ia Púch', '23917'],
          ['Xã Ia Tôr', '23908'],
          ['Xã Ia Vê', '23926'],
          ['Xã Thăng Hưng', '23896']
        ]
      },
      {
        oldDistrict: 'Huyện Chư Pưh',
        wards: [
          ['Thị trấn Nhơn Hoà', '23942'],
          ['Xã Chư Don', '23942'],
          ['Xã Ia BLứ', '23986'],
          ['Xã Ia Dreng', '23971'],
          ['Xã Ia Hla', '23977'],
          ['Xã Ia Hrú', '23971'],
          ['Xã Ia Le', '23986'],
          ['Xã Ia Phang', '23942'],
          ['Xã Ia Rong', '23971']
        ]
      },
      {
        oldDistrict: 'Huyện Chư Sê',
        wards: [
          ['Thị trấn Chư Sê', '23941'],
          ['Xã AL Bá', '23954'],
          ['Xã AYun', '23954'],
          ['Xã Bar Măih', '23947'],
          ['Xã Bờ Ngoong', '23947'],
          ['Xã Chư Pơng', '23947'],
          ['Xã Dun', '23941'],
          ['Xã H Bông', '23971'],
          ['Xã Ia Blang', '23941'],
          ['Xã Ia Glai', '23941'],
          ['Xã Ia HLốp', '23977'],
          ['Xã Ia Ko', '23977'],
          ['Xã Ia Pal', '23941'],
          ['Xã Ia Tiêm', '23947'],
          ['Xã Kông HTok', '23954']
        ]
      },
      {
        oldDistrict: 'Huyện Đăk Đoa',
        wards: [
          ['Thị trấn Đăk Đoa', '23677'],
          ['Xã A Dơk', '23710'],
          ['Xã Đăk Krong', '23701'],
          ['Xã Đăk Sơmei', '23683'],
          ['Xã Glar', '23677'],
          ["Xã H' Neng", '23701'],
          ['Xã Hà Bầu', '23590'],
          ['Xã Hà Đông', '23683'],
          ['Xã Hải Yang', '23794'],
          ['Xã HNol', '23714'],
          ['Xã Ia Băng', '23710'],
          ['Xã Ia Pết', '23710'],
          ["Xã K' Dang", '23714'],
          ['Xã Kon Gang', '23701'],
          ['Xã Nam Yang', '23701'],
          ['Xã Tân Bình', '23677'],
          ['Xã Trang', '23714']
        ]
      },
      {
        oldDistrict: 'Huyện Đăk Pơ',
        wards: [
          ['Thị trấn Đak Pơ', '23995'],
          ['Xã An Thành', '23995'],
          ['Xã Cư An', '23614'],
          ['Xã Hà Tam', '23995'],
          ['Xã Phú An', '24007'],
          ['Xã Tân An', '23614'],
          ['Xã Ya Hội', '24007'],
          ['Xã Yang Bắc', '23995']
        ]
      },
      {
        oldDistrict: 'Huyện Đức Cơ',
        wards: [
          ['Thị trấn Chư Ty', '23857'],
          ['Xã Ia Din', '23866'],
          ['Xã Ia Dom', '23872'],
          ['Xã Ia Dơk', '23869'],
          ['Xã Ia Kla', '23869'],
          ['Xã Ia Krêl', '23866'],
          ['Xã Ia Kriêng', '23857'],
          ['Xã Ia Lang', '23866'],
          ['Xã Ia Nan', '23884'],
          ['Xã Ia Pnôn', '23881']
        ]
      },
      {
        oldDistrict: 'Huyện Ia Grai',
        wards: [
          ['Thị trấn Ia Kha', '23764'],
          ['Xã Ia Bă', '23764'],
          ['Xã Ia Chia', '23788'],
          ['Xã Ia Dêr', '23767'],
          ['Xã Ia Grăng', '23764'],
          ['Xã Ia Hrung', '23767'],
          ['Xã Ia Khai', '23776'],
          ['Xã Ia KRai', '23776'],
          ['Xã Ia O', '23782'],
          ['Xã Ia Pếch', '23611'],
          ['Xã Ia Sao', '23767'],
          ['Xã Ia Tô', '23776'],
          ['Xã Ia Yok', '23767']
        ]
      },
      {
        oldDistrict: 'Huyện Ia Pa',
        wards: [
          ['Xã Chư Mố', '24028'],
          ['Xã Chư Răng', '24013'],
          ['Xã Ia Broăi', '24028'],
          ['Xã Ia KDăm', '24028'],
          ['Xã Ia Ma Rơn', '24022'],
          ['Xã Ia Trok', '24022'],
          ['Xã Ia Tul', '24028'],
          ['Xã Kim Tân', '24022'],
          ['Xã Pờ Tó', '24013']
        ]
      },
      {
        oldDistrict: 'Huyện KBang',
        wards: [
          ['Thị trấn KBang', '23638'],
          ['Xã Đak SMar', '23638'],
          ['Xã Đăk Roong', '23644'],
          ['Xã Đông', '23674'],
          ['Xã Kon Pne', '23644'],
          ['Xã Kông Bơ La', '23674'],
          ['Xã Kông Lơng Khơng', '23668'],
          ['Xã KRong', '23650'],
          ['Xã Lơ Ku', '23638'],
          ['Xã Nghĩa An', '23674'],
          ['Xã Sơ Pai', '23647'],
          ['Xã Sơn Lang', '23647'],
          ['Xã Tơ Tung', '23668']
        ]
      },
      {
        oldDistrict: 'Huyện Kông Chro',
        wards: [
          ['Thị trấn Kông Chro', '23824'],
          ['Xã An Trung', '23830'],
          ['Xã Chơ Long', '23851'],
          ['Xã Chư Krêy', '23830'],
          ['Xã Đắk Kơ Ning', '23839'],
          ['Xã Đăk Pling', '23842'],
          ['Xã Đăk Pơ Pho', '23851'],
          ['Xã Đăk Song', '23842'],
          ['Xã Đăk Tơ Pang', '23833'],
          ['Xã Kông Yang', '23833'],
          ['Xã SRó', '23839'],
          ['Xã Ya Ma', '23833'],
          ['Xã Yang Nam', '23824'],
          ['Xã Yang Trung', '23824']
        ]
      },
      {
        oldDistrict: 'Huyện Krông Pa',
        wards: [
          ['Thị trấn Phú Túc', '24076'],
          ['Xã Chư Drăng', '24109'],
          ['Xã Chư Gu', '24112'],
          ['Xã Chư Ngọc', '24076'],
          ['Xã Chư Rcăm', '24112'],
          ['Xã Đất Bằng', '24076'],
          ['Xã Ia HDreh', '24100'],
          ['Xã Ia Mláh', '24076'],
          ['Xã Ia RMok', '24100'],
          ['Xã Ia RSai', '24112'],
          ['Xã Ia RSươm', '24109'],
          ['Xã Krông Năng', '24100'],
          ['Xã Phú Cần', '24076'],
          ['Xã Uar', '24109']
        ]
      },
      {
        oldDistrict: 'Huyện Mang Yang',
        wards: [
          ['Thị trấn Kon Dơng', '23794'],
          ['Xã Ayun', '23798'],
          ['Xã Đak Jơ Ta', '23798'],
          ['Xã Đak Ta Ley', '23799'],
          ['Xã Đăk Djrăng', '23794'],
          ['Xã Đăk Trôi', '23818'],
          ['Xã Đăk Yă', '23794'],
          ['Xã Đê Ar', '23812'],
          ['Xã Hra', '23799'],
          ['Xã Kon Chiêng', '23818'],
          ['Xã Kon Thụp', '23812'],
          ['Xã Lơ Pang', '23812']
        ]
      },
      {
        oldDistrict: 'Huyện Phú Thiện',
        wards: [
          ['Thị trấn Phú Thiện', '24043'],
          ['Xã Ayun Hạ', '24049'],
          ['Xã Chrôh Pơnan', '24061'],
          ['Xã Chư A Thai', '24049'],
          ['Xã Ia Ake', '24049'],
          ['Xã Ia Hiao', '24061'],
          ['Xã Ia Peng', '24061'],
          ['Xã Ia Piar', '24043'],
          ['Xã Ia Sol', '24043'],
          ['Xã Ia Yeng', '24043']
        ]
      },
      {
        oldDistrict: 'Thành phố Pleiku',
        wards: [
          ['Phường Chi Lăng', '23586'],
          ['Phường Diên Hồng', '23563'],
          ['Phường Đống Đa', '23584'],
          ['Phường Hoa Lư', '23575'],
          ['Phường Hội Phú', '23586'],
          ['Phường Hội Thương', '23575'],
          ['Phường Ia Kring', '23563'],
          ['Phường Phù Đổng', '23575'],
          ['Phường Tây Sơn', '23575'],
          ['Phường Thắng Lợi', '23602'],
          ['Phường Thống Nhất', '23584'],
          ['Phường Trà Bá', '23586'],
          ['Phường Yên Đỗ', '23563'],
          ['Phường Yên Thế', '23584'],
          ['Xã An Phú', '23602'],
          ['Xã Biển Hồ', '23590'],
          ['Xã Chư Á', '23602'],
          ['Xã Diên Phú', '23563'],
          ['Xã Gào', '23611'],
          ['Xã Ia Kênh', '23611'],
          ['Xã Trà Đa', '23575']
        ]
      },
      {
        oldDistrict: 'Thị xã An Khê',
        wards: [
          ['Phường An Bình', '23614'],
          ['Phường An Phú', '23617'],
          ['Phường An Phước', '23617'],
          ['Phường An Tân', '23617'],
          ['Phường Ngô Mây', '23617'],
          ['Phường Tây Sơn', '23617'],
          ['Xã Cửu An', '23629'],
          ['Xã Song An', '23629'],
          ['Xã Thành An', '23617'],
          ['Xã Tú An', '23629'],
          ['Xã Xuân An', '23629']
        ]
      },
      {
        oldDistrict: 'Thị xã Ayun Pa',
        wards: [
          ['Phường Cheo Reo', '24044'],
          ['Phường Đoàn Kết', '24044'],
          ['Phường Hòa Bình', '24044'],
          ['Phường Sông Bờ', '24044'],
          ['Xã Chư Băh', '24065'],
          ['Xã Ia RBol', '24065'],
          ['Xã Ia RTô', '24073'],
          ['Xã Ia Sao', '24073']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Hà Giang',
    districts: [
      {
        oldDistrict: 'Huyện Bắc Mê',
        wards: [
          ['Thị trấn Yên Phú', '00991'],
          ['Xã Đường Âm', '01012'],
          ['Xã Đường Hồng', '01012'],
          ['Xã Giáp Trung', '00985'],
          ['Xã Lạc Nông', '00991'],
          ['Xã Minh Ngọc', '00994'],
          ['Xã Minh Sơn', '00982'],
          ['Xã Phiêng Luông', '01006'],
          ['Xã Phú Nam', '01012'],
          ['Xã Thượng Tân', '00994'],
          ['Xã Yên Cường', '01006'],
          ['Xã Yên Định', '00700'],
          ['Xã Yên Phong', '00991']
        ]
      },
      {
        oldDistrict: 'Huyện Bắc Quang',
        wards: [
          ['Thị trấn Việt Quang', '01153'],
          ['Thị trấn Vĩnh Tuy', '01156'],
          ['Xã Bằng Hành', '01180'],
          ['Xã Đồng Tâm', '01165'],
          ['Xã Đông Thành', '01156'],
          ['Xã Đồng Tiến', '01165'],
          ['Xã Đồng Yên', '01216'],
          ['Xã Đức Xuân', '01192'],
          ['Xã Hùng An', '01201'],
          ['Xã Hữu Sản', '01192'],
          ['Xã Kim Ngọc', '01180'],
          ['Xã Liên Hiệp', '01192'],
          ['Xã Quang Minh', '01153'],
          ['Xã Tân Lập', '01171'],
          ['Xã Tân Quang', '01171'],
          ['Xã Tân Thành', '01171'],
          ['Xã Thượng Bình', '01165'],
          ['Xã Tiên Kiều', '01201'],
          ['Xã Việt Hồng', '01201'],
          ['Xã Việt Vinh', '01153'],
          ['Xã Vĩnh Hảo', '01156'],
          ['Xã Vĩnh Phúc', '01216'],
          ['Xã Vô Điếm', '01180']
        ]
      },
      {
        oldDistrict: 'Huyện Đồng Văn',
        wards: [
          ['Thị trấn Đồng Văn', '00721'],
          ['Thị trấn Phó Bảng', '00745'],
          ['Xã Hố Quáng Phìn', '00763'],
          ['Xã Lũng Cú', '00715'],
          ['Xã Lũng Phìn', '00763'],
          ['Xã Lũng Táo', '00715'],
          ['Xã Lũng Thầu', '00745'],
          ['Xã Má Lé', '00715'],
          ['Xã Phố Cáo', '00745'],
          ['Xã Phố Là', '00745'],
          ['Xã Sảng Tủng', '00733'],
          ['Xã Sính Lủng', '00733'],
          ['Xã Sủng Là', '00733'],
          ['Xã Sủng Trái', '00763'],
          ['Xã Tả Lủng', '00721'],
          ['Xã Tả Phìn', '00721'],
          ['Xã Thài Phìn Tủng', '00721'],
          ['Xã Vần Chải', '00820'],
          ['Xã Xà Phìn', '00733']
        ]
      },
      {
        oldDistrict: 'Huyện Hoàng Su Phì',
        wards: [
          ['Thị trấn Vinh Quang', '01021'],
          ['Xã Bản Luốc', '01021'],
          ['Xã Bản Máy', '01024'],
          ['Xã Bản Nhùng', '01051'],
          ['Xã Bản Phùng', '01024'],
          ['Xã Chiến Phố', '01024'],
          ['Xã Đản Ván', '01021'],
          ['Xã Hồ Thầu', '01084'],
          ['Xã Nam Sơn', '01084'],
          ['Xã Nàng Đôn', '01057'],
          ['Xã Nậm Dịch', '01075'],
          ['Xã Nậm Khòa', '01084'],
          ['Xã Nậm Tỵ', '01075'],
          ['Xã Ngàm Đăng Vài', '01021'],
          ['Xã Pố Lồ', '01033'],
          ['Xã Pờ Ly Ngài', '01057'],
          ['Xã Sán Xả Hồ', '01057'],
          ['Xã Tả Sử Choóng', '01075'],
          ['Xã Tân Tiến', '01051'],
          ['Xã Thàng Tín', '01033'],
          ['Xã Thèn Chu Phìn', '01033'],
          ['Xã Thông Nguyên', '01090'],
          ['Xã Tụ Nhân', '01021'],
          ['Xã Túng Sán', '01051']
        ]
      },
      {
        oldDistrict: 'Huyện Mèo Vạc',
        wards: [
          ['Thị trấn Mèo Vạc', '00769'],
          ['Xã Cán Chu Phìn', '00802'],
          ['Xã Giàng Chu Phìn', '00769'],
          ['Xã Khâu Vai', '00802'],
          ['Xã Lũng Chinh', '00787'],
          ['Xã Lũng Pù', '00802'],
          ['Xã Nậm Ban', '00808'],
          ['Xã Niêm Sơn', '00817'],
          ['Xã Niêm Tòng', '00817'],
          ['Xã Pả Vi', '00769'],
          ['Xã Pải Lủng', '00721'],
          ['Xã Sơn Vĩ', '00778'],
          ['Xã Sủng Máng', '00787'],
          ['Xã Sủng Trà', '00787'],
          ['Xã Tả Lủng', '00769'],
          ['Xã Tát Ngà', '00808'],
          ['Xã Thượng Phùng', '00778'],
          ['Xã Xín Cái', '00778']
        ]
      },
      {
        oldDistrict: 'Huyện Quản Bạ',
        wards: [
          ['Thị trấn Tam Sơn', '00874'],
          ['Xã Bát Đại Sơn', '00883'],
          ['Xã Cán Tỷ', '00883'],
          ['Xã Cao Mã Pờ', '00892'],
          ['Xã Đông Hà', '00901'],
          ['Xã Lùng Tám', '00901'],
          ['Xã Nghĩa Thuận', '00889'],
          ['Xã Quản Bạ', '00874'],
          ['Xã Quyết Tiến', '00874'],
          ['Xã Tả Ván', '00892'],
          ['Xã Thái An', '00901'],
          ['Xã Thanh Vân', '00889'],
          ['Xã Tùng Vài', '00892']
        ]
      },
      {
        oldDistrict: 'Huyện Quang Bình',
        wards: [
          ['Thị trấn Yên Bình', '01237'],
          ['Xã Bản Rịa', '01234'],
          ['Xã Bằng Lang', '01246'],
          ['Xã Hương Sơn', '01261'],
          ['Xã Nà Khương', '01255'],
          ['Xã Tân Bắc', '01243'],
          ['Xã Tân Nam', '01237'],
          ['Xã Tân Trịnh', '01243'],
          ['Xã Tiên Nguyên', '01225'],
          ['Xã Tiên Yên', '01261'],
          ['Xã Vĩ Thượng', '01261'],
          ['Xã Xuân Giang', '01255'],
          ['Xã Xuân Minh', '01090'],
          ['Xã Yên Hà', '01246'],
          ['Xã Yên Thành', '01234']
        ]
      },
      {
        oldDistrict: 'Huyện Vị Xuyên',
        wards: [
          ['Thị trấn Nông Trường Việt Lâm', '00913'],
          ['Thị trấn Vị Xuyên', '00913'],
          ['Xã Bạch Ngọc', '00976'],
          ['Xã Cao Bồ', '00952'],
          ['Xã Đạo Đức', '00913'],
          ['Xã Kim Linh', '00706'],
          ['Xã Kim Thạch', '00706'],
          ['Xã Lao Chải', '00937'],
          ['Xã Linh Hồ', '00970'],
          ['Xã Minh Tân', '00919'],
          ['Xã Ngọc Linh', '00970'],
          ['Xã Ngọc Minh', '00976'],
          ['Xã Phong Quang', '00691'],
          ['Xã Phú Linh', '00706'],
          ['Xã Phương Tiến', '00928'],
          ['Xã Quảng Ngần', '00967'],
          ['Xã Thanh Đức', '00937'],
          ['Xã Thanh Thủy', '00928'],
          ['Xã Thuận Hoà', '00922'],
          ['Xã Thượng Sơn', '00958'],
          ['Xã Trung Thành', '00970'],
          ['Xã Tùng Bá', '00925'],
          ['Xã Việt Lâm', '00967'],
          ['Xã Xín Chải', '00937']
        ]
      },
      {
        oldDistrict: 'Huyện Xín Mần',
        wards: [
          ['Thị trấn Cốc Pài', '01096'],
          ['Xã Bản Díu', '01108'],
          ['Xã Bản Ngò', '01096'],
          ['Xã Chế Là', '01141'],
          ['Xã Chí Cà', '01108'],
          ['Xã Cốc Rế', '01117'],
          ['Xã Khuôn Lùng', '01147'],
          ['Xã Nà Chì', '01147'],
          ['Xã Nàn Ma', '01096'],
          ['Xã Nàn Xỉn', '01108'],
          ['Xã Nấm Dẩn', '01141'],
          ['Xã Pà Vầy Sủ', '01096'],
          ['Xã Quảng Nguyên', '01144'],
          ['Xã Tả Nhìu', '01141'],
          ['Xã Thèn Phàng', '01108'],
          ['Xã Thu Tà', '01117'],
          ['Xã Trung Thịnh', '01117'],
          ['Xã Xín Mần', '01108']
        ]
      },
      {
        oldDistrict: 'Huyện Yên Minh',
        wards: [
          ['Thị trấn Yên Minh', '00820'],
          ['Xã Bạch Đích', '00832'],
          ['Xã Du Già', '00871'],
          ['Xã Du Tiến', '00871'],
          ['Xã Đông Minh', '00820'],
          ['Xã Đường Thượng', '00865'],
          ['Xã Hữu Vinh', '00820'],
          ['Xã Lao Và Chải', '00820'],
          ['Xã Lũng Hồ', '00865'],
          ['Xã Mậu Duệ', '00847'],
          ['Xã Mậu Long', '00847'],
          ['Xã Na Khê', '00832'],
          ['Xã Ngam La', '00847'],
          ['Xã Ngọc Long', '00859'],
          ['Xã Phú Lũng', '00832'],
          ['Xã Sủng Thài', '00829'],
          ['Xã Sủng Tráng', '00829'],
          ['Xã Thắng Mố', '00829']
        ]
      },
      {
        oldDistrict: 'Thành phố Hà Giang',
        wards: [
          ['Phường Minh Khai', '00691'],
          ['Phường Ngọc Hà', '00691'],
          ['Phường Nguyễn Trãi', '00694'],
          ['Phường Quang Trung', '00691'],
          ['Phường Trần Phú', '00691'],
          ['Xã Ngọc Đường', '00700'],
          ['Xã Phương Độ', '00694'],
          ['Xã Phương Thiện', '00694']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Hà Nam',
    districts: [
      {
        oldDistrict: 'Huyện Bình Lục',
        wards: [
          ['Thị trấn Bình Mỹ', '13501'],
          ['Xã An Đổ', '13558'],
          ['Xã An Lão', '13558'],
          ['Xã An Ninh', '13531'],
          ['Xã Bình An', '13540'],
          ['Xã Bình Nghĩa', '13504'],
          ['Xã Bồ Đề', '13531'],
          ['Xã Đồn Xá', '13501'],
          ['Xã Đồng Du', '13504'],
          ['Xã La Sơn', '13501'],
          ['Xã Ngọc Lũ', '13540'],
          ['Xã Tiêu Động', '13558'],
          ['Xã Tràng An', '13504'],
          ['Xã Trung Lương', '13540'],
          ['Xã Vũ Bản', '13531']
        ]
      },
      {
        oldDistrict: 'Huyện Lý Nhân',
        wards: [
          ['Thị trấn Vĩnh Trụ', '13597'],
          ['Xã Bắc Lý', '13579'],
          ['Xã Chân Lý', '13579'],
          ['Xã Chính Lý', '13573'],
          ['Xã Công Lý', '13591'],
          ['Xã Đạo Lý', '13579'],
          ['Xã Đức Lý', '13591'],
          ['Xã Hòa Hậu', '13627'],
          ['Xã Hợp Lý', '13573'],
          ['Xã Nguyên Lý', '13591'],
          ['Xã Nhân Bình', '13594'],
          ['Xã Nhân Chính', '13597'],
          ['Xã Nhân Khang', '13597'],
          ['Xã Nhân Mỹ', '13609'],
          ['Xã Nhân Nghĩa', '13594'],
          ['Xã Nhân Thịnh', '13609'],
          ['Xã Phú Phúc', '13627'],
          ['Xã Tiến Thắng', '13627'],
          ['Xã Trần Hưng Đạo', '13594'],
          ['Xã Văn Lý', '13573'],
          ['Xã Xuân Khê', '13609']
        ]
      },
      {
        oldDistrict: 'Huyện Thanh Liêm',
        wards: [
          ['Thị trấn Kiện Khê', '13318'],
          ['Thị trấn Tân Thanh', '13474'],
          ['Xã Liêm Cần', '13456'],
          ['Xã Liêm Phong', '13456'],
          ['Xã Liêm Sơn', '13483'],
          ['Xã Liêm Thuận', '13483'],
          ['Xã Liêm Túc', '13483'],
          ['Xã Thanh Hà', '13456'],
          ['Xã Thanh Hải', '13489'],
          ['Xã Thanh Hương', '13495'],
          ['Xã Thanh Nghị', '13489'],
          ['Xã Thanh Nguyên', '13495'],
          ['Xã Thanh Phong', '13474'],
          ['Xã Thanh Tâm', '13495'],
          ['Xã Thanh Tân', '13489'],
          ['Xã Thanh Thủy', '13474']
        ]
      },
      {
        oldDistrict: 'Thành phố Phủ Lý',
        wards: [
          ['Phường Châu Cầu', '13285'],
          ['Phường Châu Sơn', '13318'],
          ['Phường Lam Hạ', '13366'],
          ['Phường Lê Hồng Phong', '13291'],
          ['Phường Liêm Chính', '13285'],
          ['Phường Quang Trung', '13285'],
          ['Phường Tân Hiệp', '13366'],
          ['Phường Tân Liêm', '13444'],
          ['Phường Thanh Châu', '13285'],
          ['Phường Thanh Tuyền', '13318'],
          ['Xã Đinh Xá', '13444'],
          ['Xã Kim Bình', '13291'],
          ['Xã Phù Vân', '13291'],
          ['Xã Trịnh Xá', '13444']
        ]
      },
      {
        oldDistrict: 'Thị xã Duy Tiên',
        wards: [
          ['Phường Bạch Thượng', '13348'],
          ['Phường Châu Giang', '13330'],
          ['Phường Duy Hải', '13336'],
          ['Phường Duy Minh', '13336'],
          ['Phường Đồng Văn', '13348'],
          ['Phường Hòa Mạc', '13324'],
          ['Phường Hoàng Đông', '13336'],
          ['Phường Tiên Nội', '13363'],
          ['Phường Yên Bắc', '13348'],
          ['Xã Chuyên Ngoại', '13324'],
          ['Xã Mộc Hoàn', '13330'],
          ['Xã Tiên Ngoại', '13363'],
          ['Xã Tiên Sơn', '13363'],
          ['Xã Trác Văn', '13324'],
          ['Xã Yên Nam', '13324']
        ]
      },
      {
        oldDistrict: 'Thị xã Kim Bảng',
        wards: [
          ['Phường Ba Sao', '13420'],
          ['Phường Đại Cương', '13393'],
          ['Phường Đồng Hóa', '13393'],
          ['Phường Lê Hồ', '13393'],
          ['Phường Ngọc Sơn', '13384'],
          ['Phường Quế', '13384'],
          ['Phường Tân Sơn', '13396'],
          ['Phường Tân Tựu', '13402'],
          ['Phường Thi Sơn', '13435'],
          ['Phường Tượng Lĩnh', '13396'],
          ['Xã Hoàng Tây', '13402'],
          ['Xã Khả Phong', '13420'],
          ['Xã Liên Sơn', '13435'],
          ['Xã Nguyễn Úy', '13396'],
          ['Xã Thanh Sơn', '13435'],
          ['Xã Thụy Lôi', '13420'],
          ['Xã Văn Xá', '13384']
        ]
      }
    ]
  },
  {
    oldProvince: 'Thành phố Hà Nội',
    districts: [
      {
        oldDistrict: 'Huyện Ba Vì',
        wards: [
          ['Thị trấn Tây Đằng', '09619'],
          ['Xã Ba Trại', '09694'],
          ['Xã Ba Vì', '09700'],
          ['Xã Cam Thượng', '09619'],
          ['Xã Cẩm Lĩnh', '09676'],
          ['Xã Chu Minh', '09619'],
          ['Xã Cổ Đô', '09634'],
          ['Xã Đông Quang', '09619'],
          ['Xã Đồng Thái', '09664'],
          ['Xã Khánh Thượng', '09700'],
          ['Xã Minh Châu', '09661'],
          ['Xã Minh Quang', '09700'],
          ['Xã Phong Vân', '09634'],
          ['Xã Phú Châu', '09664'],
          ['Xã Phú Cường', '09634'],
          ['Xã Phú Đông', '09634'],
          ['Xã Phú Hồng', '09634'],
          ['Xã Phú Sơn', '09664'],
          ['Xã Sơn Đà', '09676'],
          ['Xã Tản Lĩnh', '09694'],
          ['Xã Thái Hòa', '09664'],
          ['Xã Thuần Mỹ', '09676'],
          ['Xã Thụy An', '09619'],
          ['Xã Tiên Phong', '09619'],
          ['Xã Tòng Bạt', '09676'],
          ['Xã Vạn Thắng', '09634'],
          ['Xã Vân Hòa', '09706'],
          ['Xã Vật Lại', '09664'],
          ['Xã Yên Bài', '09706']
        ]
      },
      {
        oldDistrict: 'Huyện Chương Mỹ',
        wards: [
          ['Thị trấn Chúc Sơn', '10015'],
          ['Thị trấn Xuân Mai', '10045'],
          ['Xã Đại Yên', '10015'],
          ['Xã Đồng Lạc', '10096'],
          ['Xã Đông Phương Yên', '10030'],
          ['Xã Đông Sơn', '10030'],
          ['Xã Hòa Phú', '10096'],
          ['Xã Hoàng Diệu', '10072'],
          ['Xã Hoàng Văn Thụ', '10081'],
          ['Xã Hồng Phú', '10096'],
          ['Xã Hợp Đồng', '10072'],
          ['Xã Hữu Văn', '10081'],
          ['Xã Lam Điền', '10072'],
          ['Xã Mỹ Lương', '10081'],
          ['Xã Nam Phương Tiến', '10045'],
          ['Xã Ngọc Hòa', '10015'],
          ['Xã Phú Nghĩa', '10030'],
          ['Xã Phụng Châu', '10015'],
          ['Xã Quảng Bị', '10072'],
          ['Xã Tân Tiến', '10045'],
          ['Xã Thanh Bình', '10030'],
          ['Xã Thụy Hương', '10015'],
          ['Xã Thủy Xuân Tiên', '10045'],
          ['Xã Thượng Vực', '10096'],
          ['Xã Tiên Phương', '10015'],
          ['Xã Tốt Động', '10072'],
          ['Xã Trần Phú', '10081'],
          ['Xã Trung Hòa', '10030'],
          ['Xã Trường Yên', '10030'],
          ['Xã Văn Võ', '10096']
        ]
      },
      {
        oldDistrict: 'Huyện Đan Phượng',
        wards: [
          ['Thị trấn Phùng', '09784'],
          ['Xã Đan Phượng', '09784'],
          ['Xã Đồng Tháp', '09784'],
          ['Xã Hạ Mỗ', '09817'],
          ['Xã Hồng Hà', '09817'],
          ['Xã Liên Hà', '09817'],
          ['Xã Liên Hồng', '09817'],
          ['Xã Liên Trung', '09817'],
          ['Xã Phương Đình', '09787'],
          ['Xã Song Phượng', '09784'],
          ['Xã Tân Hội', '09817'],
          ['Xã Tân Lập', '09817'],
          ['Xã Thọ An', '09787'],
          ['Xã Thọ Xuân', '09787'],
          ['Xã Thượng Mỗ', '09784'],
          ['Xã Trung Châu', '09787']
        ]
      },
      {
        oldDistrict: 'Huyện Đông Anh',
        wards: [
          ['Thị trấn Đông Anh', '00454'],
          ['Xã Bắc Hồng', '00466'],
          ['Xã Cổ Loa', '00454'],
          ['Xã Dục Tú', '00454'],
          ['Xã Đại Mạch', '00493'],
          ['Xã Đông Hội', '00454'],
          ['Xã Hải Bối', '00508'],
          ['Xã Kim Chung', '00493'],
          ['Xã Kim Nỗ', '00493'],
          ['Xã Liên Hà', '00475'],
          ['Xã Mai Lâm', '00454'],
          ['Xã Nam Hồng', '00466'],
          ['Xã Nguyên Khê', '00466'],
          ['Xã Tàm Xá', '00508'],
          ['Xã Thuỵ Lâm', '00475'],
          ['Xã Tiên Dương', '00466'],
          ['Xã Uy Nỗ', '00454'],
          ['Xã Vân Hà', '00475'],
          ['Xã Vân Nội', '00466'],
          ['Xã Việt Hùng', '00454'],
          ['Xã Vĩnh Ngọc', '00508'],
          ['Xã Võng La', '00493'],
          ['Xã Xuân Canh', '00508'],
          ['Xã Xuân Nộn', '00475']
        ]
      },
      {
        oldDistrict: 'Huyện Gia Lâm',
        wards: [
          ['Thị trấn Trâu Quỳ', '00565'],
          ['Thị trấn Yên Viên', '00541'],
          ['Xã Bát Tràng', '00577'],
          ['Xã Cổ Bi', '00565'],
          ['Xã Dương Quang', '00562'],
          ['Xã Dương Xá', '00565'],
          ['Xã Đa Tốn', '00577'],
          ['Xã Đặng Xá', '00562'],
          ['Xã Kiêu Kỵ', '00565'],
          ['Xã Kim Đức', '00577'],
          ['Xã Lệ Chi', '00562'],
          ['Xã Ninh Hiệp', '00541'],
          ['Xã Phù Đổng', '00541'],
          ['Xã Phú Sơn', '00562'],
          ['Xã Thiên Đức', '00541'],
          ['Xã Yên Thường', '00541'],
          ['Xã Yên Viên', '00541']
        ]
      },
      {
        oldDistrict: 'Huyện Hoài Đức',
        wards: [
          ['Thị trấn Trạm Trôi', '09832'],
          ['Xã An Khánh', '09877'],
          ['Xã An Thượng', '09877'],
          ['Xã Cát Quế', '09856'],
          ['Xã Di Trạch', '09832'],
          ['Xã Dương Liễu', '09856'],
          ['Xã Đắc Sở', '09856'],
          ['Xã Đông La', '09877'],
          ['Xã Đức Giang', '09832'],
          ['Xã Đức Thượng', '09832'],
          ['Xã Kim Chung', '09832'],
          ['Xã La Phù', '09877'],
          ['Xã Lại Yên', '09871'],
          ['Xã Minh Khai', '09856'],
          ['Xã Song Phương', '09871'],
          ['Xã Sơn Đồng', '09871'],
          ['Xã Tiền Yên', '09871'],
          ['Xã Vân Canh', '09871'],
          ['Xã Vân Côn', '09877'],
          ['Xã Yên Sở', '09856']
        ]
      },
      {
        oldDistrict: 'Huyện Mê Linh',
        wards: [
          ['Thị trấn Chi Đông', '08974'],
          ['Thị trấn Quang Minh', '08974'],
          ['Xã Chu Phan', '08980'],
          ['Xã Đại Thịnh', '08974'],
          ['Xã Hoàng Kim', '08980'],
          ['Xã Kim Hoa', '08974'],
          ['Xã Liên Mạc', '08980'],
          ['Xã Mê Linh', '09022'],
          ['Xã Tam Đồng', '08995'],
          ['Xã Thạch Đà', '08980'],
          ['Xã Thanh Lâm', '08995'],
          ['Xã Tiền Phong', '09022'],
          ['Xã Tiến Thắng', '08995'],
          ['Xã Tiến Thịnh', '08980'],
          ['Xã Tráng Việt', '09022'],
          ['Xã Tự Lập', '08995'],
          ['Xã Văn Khê', '09022']
        ]
      },
      {
        oldDistrict: 'Huyện Mỹ Đức',
        wards: [
          ['Thị trấn Đại Nghĩa', '10441'],
          ['Xã An Mỹ', '10465'],
          ['Xã An Phú', '10441'],
          ['Xã An Tiến', '10489'],
          ['Xã Đại Hưng', '10441'],
          ['Xã Đồng Tâm', '10459'],
          ['Xã Hồng Sơn', '10465'],
          ['Xã Hợp Thanh', '10441'],
          ['Xã Hợp Tiến', '10465'],
          ['Xã Hùng Tiến', '10489'],
          ['Xã Hương Sơn', '10489'],
          ['Xã Lê Thanh', '10465'],
          ['Xã Mỹ Xuyên', '10459'],
          ['Xã Phù Lưu Tế', '10441'],
          ['Xã Phúc Lâm', '10459'],
          ['Xã Phùng Xá', '10465'],
          ['Xã Thượng Lâm', '10459'],
          ['Xã Tuy Lai', '10459'],
          ['Xã Vạn Tín', '10489'],
          ['Xã Xuy Xá', '10465']
        ]
      },
      {
        oldDistrict: 'Huyện Phú Xuyên',
        wards: [
          ['Thị trấn Phú Minh', '10273'],
          ['Thị trấn Phú Xuyên', '10273'],
          ['Xã Bạch Hạ', '10342'],
          ['Xã Châu Can', '10330'],
          ['Xã Chuyên Mỹ', '10330'],
          ['Xã Đại Xuyên', '10342'],
          ['Xã Hoàng Long', '10279'],
          ['Xã Hồng Minh', '10279'],
          ['Xã Hồng Thái', '10273'],
          ['Xã Khai Thái', '10342'],
          ['Xã Minh Tân', '10342'],
          ['Xã Nam Phong', '10273'],
          ['Xã Nam Tiến', '10273'],
          ['Xã Phú Túc', '10279'],
          ['Xã Phú Yên', '10330'],
          ['Xã Phúc Tiến', '10342'],
          ['Xã Phượng Dực', '10279'],
          ['Xã Quang Hà', '10273'],
          ['Xã Quang Lãng', '10342'],
          ['Xã Tân Dân', '10330'],
          ['Xã Tri Thủy', '10342'],
          ['Xã Văn Hoàng', '10279'],
          ['Xã Vân Từ', '10330']
        ]
      },
      {
        oldDistrict: 'Huyện Phúc Thọ',
        wards: [
          ['Thị trấn Phúc Thọ', '09715'],
          ['Xã Hát Môn', '09772'],
          ['Xã Hiệp Thuận', '09772'],
          ['Xã Liên Hiệp', '09772'],
          ['Xã Long Thượng', '09715'],
          ['Xã Nam Hà', '09739'],
          ['Xã Ngọc Tảo', '09772'],
          ['Xã Phúc Hòa', '09715'],
          ['Xã Phụng Thượng', '09715'],
          ['Xã Sen Phương', '09739'],
          ['Xã Tam Hiệp', '09772'],
          ['Xã Tam Thuấn', '09772'],
          ['Xã Thanh Đa', '09772'],
          ['Xã Tích Lộc', '09715'],
          ['Xã Trạch Mỹ Lộc', '09715'],
          ['Xã Vân Phúc', '09739'],
          ['Xã Võng Xuyên', '09739'],
          ['Xã Xuân Đình', '09739']
        ]
      },
      {
        oldDistrict: 'Huyện Quốc Oai',
        wards: [
          ['Thị trấn Quốc Oai', '09895'],
          ['Xã Cấn Hữu', '09910'],
          ['Xã Cộng Hòa', '09931'],
          ['Xã Đồng Quang', '09931'],
          ['Xã Đông Xuân', '04930'],
          ['Xã Đông Yên', '09952'],
          ['Xã Hòa Thạch', '09952'],
          ['Xã Hưng Đạo', '09931'],
          ['Xã Liệp Nghĩa', '09910'],
          ['Xã Ngọc Liệp', '09910'],
          ['Xã Ngọc Mỹ', '09910'],
          ['Xã Phú Cát', '09952'],
          ['Xã Phú Mãn', '09952'],
          ['Xã Phượng Sơn', '09895'],
          ['Xã Sài Sơn', '09895'],
          ['Xã Thạch Thán', '09895'],
          ['Xã Tuyết Nghĩa', '09910']
        ]
      },
      {
        oldDistrict: 'Huyện Sóc Sơn',
        wards: [
          ['Thị trấn Sóc Sơn', '00376'],
          ['Xã Bắc Phú', '00430'],
          ['Xã Bắc Sơn', '00385'],
          ['Xã Đông Xuân', '00376'],
          ['Xã Đức Hoà', '00430'],
          ['Xã Hiền Ninh', '00433'],
          ['Xã Hồng Kỳ', '00385'],
          ['Xã Kim Lũ', '00430'],
          ['Xã Mai Đình', '00376'],
          ['Xã Minh Phú', '00382'],
          ['Xã Minh Trí', '00382'],
          ['Xã Nam Sơn', '00385'],
          ['Xã Phú Cường', '00433'],
          ['Xã Phù Linh', '00376'],
          ['Xã Phù Lỗ', '00376'],
          ['Xã Phú Minh', '00433'],
          ['Xã Quang Tiến', '00433'],
          ['Xã Tân Dân', '00382'],
          ['Xã Tân Hưng', '00430'],
          ['Xã Tân Minh', '00376'],
          ['Xã Thanh Xuân', '00433'],
          ['Xã Tiên Dược', '00376'],
          ['Xã Trung Giã', '00385'],
          ['Xã Việt Long', '00430'],
          ['Xã Xuân Giang', '00430'],
          ['Xã Xuân Thu', '00430']
        ]
      },
      {
        oldDistrict: 'Huyện Thạch Thất',
        wards: [
          ['Thị trấn Liên Quan', '09955'],
          ['Xã Bình Yên', '09982'],
          ['Xã Cẩm Yên', '09955'],
          ['Xã Cần Kiệm', '09982'],
          ['Xã Đại Đồng', '09955'],
          ['Xã Đồng Trúc', '09982'],
          ['Xã Hạ Bằng', '09982'],
          ['Xã Hương Ngải', '10003'],
          ['Xã Kim Quan', '09955'],
          ['Xã Lại Thượng', '09955'],
          ['Xã Lam Sơn', '10003'],
          ['Xã Phú Kim', '09955'],
          ['Xã Phùng Xá', '10003'],
          ['Xã Quang Trung', '10003'],
          ['Xã Tân Xã', '09988'],
          ['Xã Thạch Hoà', '09988'],
          ['Xã Thạch Xá', '10003'],
          ['Xã Tiến Xuân', '04930'],
          ['Xã Yên Bình', '04930'],
          ['Xã Yên Trung', '04930']
        ]
      },
      {
        oldDistrict: 'Huyện Thanh Oai',
        wards: [
          ['Thị trấn Kim Bài', '10114'],
          ['Xã Bích Hòa', '10126'],
          ['Xã Bình Minh', '10126'],
          ['Xã Cao Viên', '10126'],
          ['Xã Cao Xuân Dương', '10180'],
          ['Xã Cự Khê', '10126'],
          ['Xã Dân Hòa', '10180'],
          ['Xã Đỗ Động', '10114'],
          ['Xã Hồng Dương', '10180'],
          ['Xã Kim An', '10114'],
          ['Xã Kim Thư', '10114'],
          ['Xã Liên Châu', '10180'],
          ['Xã Mỹ Hưng', '10144'],
          ['Xã Phương Trung', '10114'],
          ['Xã Tam Hưng', '10144'],
          ['Xã Tân Ước', '10180'],
          ['Xã Thanh Cao', '10126'],
          ['Xã Thanh Mai', '10114'],
          ['Xã Thanh Thùy', '10144'],
          ['Xã Thanh Văn', '10144']
        ]
      },
      {
        oldDistrict: 'Huyện Thanh Trì',
        wards: [
          ['Thị trấn Văn Điển', '00640'],
          ['Xã Duyên Hà', '00685'],
          ['Xã Đại áng', '00679'],
          ['Xã Đông Mỹ', '00685'],
          ['Xã Hữu Hoà', '00664'],
          ['Xã Liên Ninh', '00679'],
          ['Xã Ngọc Hồi', '00679'],
          ['Xã Ngũ Hiệp', '00640'],
          ['Xã Tả Thanh Oai', '00664'],
          ['Xã Tam Hiệp', '00337'],
          ['Xã Tân Triều', '00643'],
          ['Xã Thanh Liệt', '00643'],
          ['Xã Tứ Hiệp', '00640'],
          ['Xã Vạn Phúc', '00685'],
          ['Xã Vĩnh Quỳnh', '00664'],
          ['Xã Yên Mỹ', '00640']
        ]
      },
      {
        oldDistrict: 'Huyện Thường Tín',
        wards: [
          ['Thị trấn Thường Tín', '10183'],
          ['Xã Chương Dương', '10237'],
          ['Xã Dũng Tiến', '10231'],
          ['Xã Duyên Thái', '10210'],
          ['Xã Hà Hồi', '10210'],
          ['Xã Hiền Giang', '10183'],
          ['Xã Hòa Bình', '10183'],
          ['Xã Hồng Vân', '10210'],
          ['Xã Khánh Hà', '10183'],
          ['Xã Lê Lợi', '10237'],
          ['Xã Liên Phương', '10210'],
          ['Xã Minh Cường', '10273'],
          ['Xã Nghiêm Xuyên', '10231'],
          ['Xã Nguyễn Trãi', '10231'],
          ['Xã Nhị Khê', '10183'],
          ['Xã Ninh Sở', '10210'],
          ['Xã Quất Động', '10231'],
          ['Xã Tân Minh', '10231'],
          ['Xã Thắng Lợi', '10237'],
          ['Xã Tiền Phong', '10183'],
          ['Xã Tô Hiệu', '10237'],
          ['Xã Tự Nhiên', '10237'],
          ['Xã Vạn Nhất', '10273'],
          ['Xã Văn Bình', '10183'],
          ['Xã Văn Phú', '10183'],
          ['Xã Văn Tự', '10273'],
          ['Xã Vân Tảo', '10210']
        ]
      },
      {
        oldDistrict: 'Huyện Ứng Hòa',
        wards: [
          ['Thị trấn Vân Đình', '10354'],
          ['Xã Bình Lưu Quang', '10417'],
          ['Xã Cao Sơn Tiến', '10354'],
          ['Xã Đại Cường', '10402'],
          ['Xã Đại Hùng', '10402'],
          ['Xã Đông Lỗ', '10402'],
          ['Xã Đồng Tân', '10402'],
          ['Xã Hòa Phú', '10417'],
          ['Xã Hoa Viên', '10369'],
          ['Xã Kim Đường', '10402'],
          ['Xã Liên Bạt', '10369'],
          ['Xã Minh Đức', '10402'],
          ['Xã Phù Lưu', '10417'],
          ['Xã Phương Tú', '10354'],
          ['Xã Quảng Phú Cầu', '10369'],
          ['Xã Tảo Dương Văn', '10354'],
          ['Xã Thái Hòa', '10417'],
          ['Xã Trầm Lộng', '10402'],
          ['Xã Trung Tú', '10402'],
          ['Xã Trường Thịnh', '10369']
        ]
      },
      {
        oldDistrict: 'Quận Ba Đình',
        wards: [
          ['Phường Cống Vị', '00008'],
          ['Phường Điện Biên', '00004'],
          ['Phường Đội Cấn', '00004'],
          ['Phường Giảng Võ', '00025'],
          ['Phường Kim Mã', '00025'],
          ['Phường Liễu Giai', '00008'],
          ['Phường Ngọc Hà', '00008'],
          ['Phường Ngọc Khánh', '00025'],
          ['Phường Phúc Xá', '00097'],
          ['Phường Quán Thánh', '00004'],
          ['Phường Thành Công', '00025'],
          ['Phường Trúc Bạch', '00004'],
          ['Phường Vĩnh Phúc', '00008']
        ]
      },
      {
        oldDistrict: 'Quận Bắc Từ Liêm',
        wards: [
          ['Phường Cổ Nhuế 1', '00160'],
          ['Phường Cổ Nhuế 2', '00602'],
          ['Phường Đông Ngạc', '00602'],
          ['Phường Đức Thắng', '00602'],
          ['Phường Liên Mạc', '00598'],
          ['Phường Minh Khai', '00613'],
          ['Phường Phú Diễn', '00619'],
          ['Phường Phúc Diễn', '00619'],
          ['Phường Tây Tựu', '00613'],
          ['Phường Thụy Phương', '00602'],
          ['Phường Thượng Cát', '00598'],
          ['Phường Xuân Đỉnh', '00611'],
          ['Phường Xuân Tảo', '00611']
        ]
      },
      {
        oldDistrict: 'Quận Cầu Giấy',
        wards: [
          ['Phường Dịch Vọng', '00166'],
          ['Phường Dịch Vọng Hậu', '00166'],
          ['Phường Mai Dịch', '00619'],
          ['Phường Nghĩa Đô', '00160'],
          ['Phường Nghĩa Tân', '00160'],
          ['Phường Quan Hoa', '00160'],
          ['Phường Trung Hoà', '00175'],
          ['Phường Yên Hoà', '00175']
        ]
      },
      {
        oldDistrict: 'Quận Đống Đa',
        wards: [
          ['Phường Cát Linh', '00190'],
          ['Phường Hàng Bột', '00226'],
          ['Phường Khâm Thiên', '00226'],
          ['Phường Khương Thượng', '00229'],
          ['Phường Kim Liên', '00229'],
          ['Phường Láng Hạ', '00199'],
          ['Phường Láng Thượng', '00199'],
          ['Phường Nam Đồng', '00235'],
          ['Phường Ô Chợ Dừa', '00190'],
          ['Phường Phương Liên - Trung Tự', '00226'],
          ['Phường Phương Mai', '00229'],
          ['Phường Quang Trung', '00229'],
          ['Phường Thịnh Quang', '00235'],
          ['Phường Thổ Quan', '00226'],
          ['Phường Trung Liệt', '00235'],
          ['Phường Văn Chương', '00226'],
          ['Phường Văn Miếu - Quốc Tử Giám', '00226']
        ]
      },
      {
        oldDistrict: 'Quận Hà Đông',
        wards: [
          ['Phường Biên Giang', '10015'],
          ['Phường Dương Nội', '09886'],
          ['Phường Đồng Mai', '09562'],
          ['Phường Hà Cầu', '09556'],
          ['Phường Kiến Hưng', '09552'],
          ['Phường La Khê', '09556'],
          ['Phường Mộ Lao', '09556'],
          ['Phường Phú La', '09552'],
          ['Phường Phú Lãm', '09568'],
          ['Phường Phú Lương', '09568'],
          ['Phường Phúc La', '09556'],
          ['Phường Quang Trung', '09556'],
          ['Phường Vạn Phúc', '09556'],
          ['Phường Văn Quán', '09556'],
          ['Phường Yên Nghĩa', '09562']
        ]
      },
      {
        oldDistrict: 'Quận Hai Bà Trưng',
        wards: [
          ['Phường Bạch Đằng', '00097'],
          ['Phường Bách Khoa', '00292'],
          ['Phường Bạch Mai', '00292'],
          ['Phường Đồng Nhân', '00256'],
          ['Phường Đồng Tâm', '00292'],
          ['Phường Lê Đại Hành', '00256'],
          ['Phường Minh Khai', '00292'],
          ['Phường Nguyễn Du', '00256'],
          ['Phường Phạm Đình Hổ', '00256'],
          ['Phường Phố Huế', '00256'],
          ['Phường Quỳnh Mai', '00292'],
          ['Phường Thanh Lương', '00283'],
          ['Phường Thanh Nhàn', '00292'],
          ['Phường Trương Định', '00322'],
          ['Phường Vĩnh Tuy', '00283']
        ]
      },
      {
        oldDistrict: 'Quận Hoàn Kiếm',
        wards: [
          ['Phường Chương Dương', '00097'],
          ['Phường Cửa Đông', '00070'],
          ['Phường Cửa Nam', '00082'],
          ['Phường Đồng Xuân', '00070'],
          ['Phường Hàng Bạc', '00070'],
          ['Phường Hàng Bài', '00082'],
          ['Phường Hàng Bồ', '00070'],
          ['Phường Hàng Bông', '00070'],
          ['Phường Hàng Buồm', '00070'],
          ['Phường Hàng Đào', '00070'],
          ['Phường Hàng Gai', '00070'],
          ['Phường Hàng Mã', '00070'],
          ['Phường Hàng Trống', '00070'],
          ['Phường Lý Thái Tổ', '00070'],
          ['Phường Phan Chu Trinh', '00082'],
          ['Phường Phúc Tân', '00097'],
          ['Phường Tràng Tiền', '00082'],
          ['Phường Trần Hưng Đạo', '00082']
        ]
      },
      {
        oldDistrict: 'Quận Hoàng Mai',
        wards: [
          ['Phường Đại Kim', '00316'],
          ['Phường Định Công', '00316'],
          ['Phường Giáp Bát', '00322'],
          ['Phường Hoàng Liệt', '00337'],
          ['Phường Hoàng Văn Thụ', '00322'],
          ['Phường Lĩnh Nam', '00328'],
          ['Phường Mai Động', '00283'],
          ['Phường Tân Mai', '00331'],
          ['Phường Thanh Trì', '00301'],
          ['Phường Thịnh Liệt', '00331'],
          ['Phường Trần Phú', '00328'],
          ['Phường Tương Mai', '00322'],
          ['Phường Vĩnh Hưng', '00301'],
          ['Phường Yên Sở', '00340']
        ]
      },
      {
        oldDistrict: 'Quận Long Biên',
        wards: [
          ['Phường Bồ Đề', '00118'],
          ['Phường Cự Khối', '00145'],
          ['Phường Đức Giang', '00127'],
          ['Phường Gia Thụy', '00118'],
          ['Phường Giang Biên', '00127'],
          ['Phường Long Biên', '00145'],
          ['Phường Ngọc Lâm', '00118'],
          ['Phường Ngọc Thụy', '00118'],
          ['Phường Phúc Đồng', '00136'],
          ['Phường Phúc Lợi', '00136'],
          ['Phường Thạch Bàn', '00145'],
          ['Phường Thượng Thanh', '00127'],
          ['Phường Việt Hưng', '00127']
        ]
      },
      {
        oldDistrict: 'Quận Nam Từ Liêm',
        wards: [
          ['Phường Cầu Diễn', '00592'],
          ['Phường Đại Mỗ', '00634'],
          ['Phường Mễ Trì', '00592'],
          ['Phường Mỹ Đình 1', '00592'],
          ['Phường Mỹ Đình 2', '00592'],
          ['Phường Phú Đô', '00592'],
          ['Phường Phương Canh', '00622'],
          ['Phường Tây Mỗ', '00634'],
          ['Phường Trung Văn', '00637'],
          ['Phường Xuân Phương', '00622']
        ]
      },
      {
        oldDistrict: 'Quận Tây Hồ',
        wards: [
          ['Phường Bưởi', '00103'],
          ['Phường Nhật Tân', '00097'],
          ['Phường Phú Thượng', '00091'],
          ['Phường Quảng An', '00103'],
          ['Phường Thụy Khuê', '00103'],
          ['Phường Tứ Liên', '00097'],
          ['Phường Xuân La', '00103'],
          ['Phường Yên Phụ', '00097']
        ]
      },
      {
        oldDistrict: 'Quận Thanh Xuân',
        wards: [
          ['Phường Hạ Đình', '00364'],
          ['Phường Khương Đình', '00364'],
          ['Phường Khương Mai', '00352'],
          ['Phường Khương Trung', '00364'],
          ['Phường Nhân Chính', '00367'],
          ['Phường Phương Liệt', '00352'],
          ['Phường Thanh Xuân Bắc', '00367'],
          ['Phường Thanh Xuân Trung', '00367'],
          ['Phường Thượng Đình', '00364']
        ]
      },
      {
        oldDistrict: 'Thị xã Sơn Tây',
        wards: [
          ['Phường Ngô Quyền', '09574'],
          ['Phường Phú Thịnh', '09574'],
          ['Phường Sơn Lộc', '09574'],
          ['Phường Trung Hưng', '09574'],
          ['Phường Trung Sơn Trầm', '09604'],
          ['Phường Viên Sơn', '09574'],
          ['Phường Xuân Khanh', '09604'],
          ['Xã Cổ Đông', '09616'],
          ['Xã Đường Lâm', '09574'],
          ['Xã Kim Sơn', '09616'],
          ['Xã Sơn Đông', '09616'],
          ['Xã Thanh Mỹ', '09604'],
          ['Xã Xuân Sơn', '09604']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Hà Tĩnh',
    districts: [
      {
        oldDistrict: 'Huyện Can Lộc',
        wards: [
          ['Thị trấn Đồng Lộc', '18484'],
          ['Thị trấn Nghèn', '18406'],
          ['Xã Gia Hanh', '18466'],
          ['Xã Khánh Vĩnh Yên', '18466'],
          ['Xã Kim Song Trường', '18436'],
          ['Xã Mỹ Lộc', '18484'],
          ['Xã Phú Lộc', '18436'],
          ['Xã Quang Lộc', '18481'],
          ['Xã Sơn Lộc', '18481'],
          ['Xã Thanh Lộc', '18466'],
          ['Xã Thiên Lộc', '18406'],
          ['Xã Thuần Thiện', '18418'],
          ['Xã Thượng Lộc', '18484'],
          ['Xã Thường Nga', '18436'],
          ['Xã Tùng Lộc', '18418'],
          ['Xã Vượng Lộc', '18406'],
          ['Xã Xuân Lộc', '18481']
        ]
      },
      {
        oldDistrict: 'Huyện Cẩm Xuyên',
        wards: [
          ['Thị trấn Cẩm Xuyên', '18673'],
          ['Thị trấn Thiên Cầm', '18676'],
          ['Xã Cẩm Duệ', '18739'],
          ['Xã Cẩm Dương', '18682'],
          ['Xã Cẩm Hà', '18736'],
          ['Xã Cẩm Hưng', '18736'],
          ['Xã Cẩm Lạc', '18748'],
          ['Xã Cẩm Lĩnh', '18742'],
          ['Xã Cẩm Lộc', '18742'],
          ['Xã Cẩm Minh', '18748'],
          ['Xã Cẩm Mỹ', '18739'],
          ['Xã Cẩm Nhượng', '18676'],
          ['Xã Cẩm Quan', '18673'],
          ['Xã Cẩm Quang', '18673'],
          ['Xã Cẩm Sơn', '18748'],
          ['Xã Cẩm Thạch', '18739'],
          ['Xã Cẩm Thành', '18685'],
          ['Xã Cẩm Thịnh', '18736'],
          ['Xã Cẩm Trung', '18742'],
          ['Xã Nam Phúc Thăng', '18676'],
          ['Xã Yên Hòa', '18682']
        ]
      },
      {
        oldDistrict: 'Huyện Đức Thọ',
        wards: [
          ['Thị trấn Đức Thọ', '18229'],
          ['Xã An Dũng', '18277'],
          ['Xã Bùi La Nhân', '18262'],
          ['Xã Đức Đồng', '18304'],
          ['Xã Đức Lạng', '18304'],
          ['Xã Hòa Lạc', '18229'],
          ['Xã Lâm Trung Thủy', '18277'],
          ['Xã Liên Minh', '18244'],
          ['Xã Quang Vĩnh', '18262'],
          ['Xã Tân Dân', '18229'],
          ['Xã Tân Hương', '18304'],
          ['Xã Thanh Bình Thịnh', '18277'],
          ['Xã Trường Sơn', '18244'],
          ['Xã Tùng Ảnh', '18229'],
          ['Xã Tùng Châu', '18244'],
          ['Xã Yên Hồ', '18262']
        ]
      },
      {
        oldDistrict: 'Huyện Hương Khê',
        wards: [
          ['Thị trấn Hương Khê', '18496'],
          ['Xã Điền Mỹ', '18502'],
          ['Xã Gia Phố', '18532'],
          ['Xã Hà Linh', '18502'],
          ['Xã Hòa Hải', '18523'],
          ['Xã Hương Bình', '18523'],
          ['Xã Hương Đô', '18550'],
          ['Xã Hương Giang', '18532'],
          ['Xã Hương Lâm', '18544'],
          ['Xã Hương Liên', '18547'],
          ['Xã Hương Long', '18496'],
          ['Xã Hương Thủy', '18532'],
          ['Xã Hương Trà', '18550'],
          ['Xã Hương Trạch', '18547'],
          ['Xã Hương Vĩnh', '18544'],
          ['Xã Hương Xuân', '18544'],
          ['Xã Lộc Yên', '18550'],
          ['Xã Phú Gia', '18496'],
          ['Xã Phúc Đồng', '18523'],
          ['Xã Phúc Trạch', '18547']
        ]
      },
      {
        oldDistrict: 'Huyện Hương Sơn',
        wards: [
          ['Thị trấn Phố Châu', '18133'],
          ['Thị trấn Tây Sơn', '18172'],
          ['Xã An Hòa Thịnh', '18163'],
          ['Xã Châu Bình', '18202'],
          ['Xã Hàm Trường', '18223'],
          ['Xã Kim Hoa', '18223'],
          ['Xã Mỹ Long', '18202'],
          ['Xã Quang Diệm', '18184'],
          ['Xã Sơn Bằng', '18133'],
          ['Xã Sơn Giang', '18184'],
          ['Xã Sơn Hồng', '18160'],
          ['Xã Sơn Kim 1', '18196'],
          ['Xã Sơn Kim 2', '18199'],
          ['Xã Sơn Lâm', '18184'],
          ['Xã Sơn Lễ', '18163'],
          ['Xã Sơn Lĩnh', '18160'],
          ['Xã Sơn Ninh', '18133'],
          ['Xã Sơn Phú', '18133'],
          ['Xã Sơn Tây', '18172'],
          ['Xã Sơn Tiến', '18163'],
          ['Xã Sơn Trung', '18133'],
          ['Xã Tân Mỹ Hà', '18202']
        ]
      },
      {
        oldDistrict: 'Huyện Kỳ Anh',
        wards: [
          ['Thị trấn Kỳ Đồng', '18775'],
          ['Xã Kỳ Bắc', '18766'],
          ['Xã Kỳ Châu', '18754'],
          ['Xã Kỳ Giang', '18775'],
          ['Xã Kỳ Hải', '18781'],
          ['Xã Kỳ Khang', '18790'],
          ['Xã Kỳ Lạc', '18838'],
          ['Xã Kỳ Phong', '18766'],
          ['Xã Kỳ Phú', '18775'],
          ['Xã Kỳ Sơn', '18844'],
          ['Xã Kỳ Tân', '18814'],
          ['Xã Kỳ Tây', '18787'],
          ['Xã Kỳ Thọ', '18790'],
          ['Xã Kỳ Thư', '18790'],
          ['Xã Kỳ Thượng', '18844'],
          ['Xã Kỳ Tiến', '18775'],
          ['Xã Kỳ Trung', '18787'],
          ['Xã Kỳ Văn', '18787'],
          ['Xã Kỳ Xuân', '18766'],
          ['Xã Lâm Hợp', '18838']
        ]
      },
      {
        oldDistrict: 'Huyện Nghi Xuân',
        wards: [
          ['Thị trấn Tiên Điền', '18373'],
          ['Thị trấn Xuân An', '18352'],
          ['Xã Cỗ Đạm', '18394'],
          ['Xã Cương Gián', '18394'],
          ['Xã Đan Trường', '18364'],
          ['Xã Xuân Giang', '18352'],
          ['Xã Xuân Hải', '18364'],
          ['Xã Xuân Hội', '18364'],
          ['Xã Xuân Hồng', '18352'],
          ['Xã Xuân Lam', '18115'],
          ['Xã Xuân Liên', '18394'],
          ['Xã Xuân Lĩnh', '18352'],
          ['Xã Xuân Mỹ', '18373'],
          ['Xã Xuân Phổ', '18364'],
          ['Xã Xuân Thành', '18373'],
          ['Xã Xuân Viên', '18352'],
          ['Xã Xuân Yên', '18373']
        ]
      },
      {
        oldDistrict: 'Huyện Thạch Hà',
        wards: [
          ['Thị trấn Lộc Hà', '18568'],
          ['Thị trấn Thạch Hà', '18562'],
          ['Xã Bình An', '18568'],
          ['Xã Hồng Lộc', '18409'],
          ['Xã Ích Hậu', '18586'],
          ['Xã Lưu Vĩnh Sơn', '18634'],
          ['Xã Mai Phụ', '18583'],
          ['Xã Nam Điền', '18667'],
          ['Xã Ngọc Sơn', '18634'],
          ['Xã Phù Lưu', '18583'],
          ['Xã Tân Lộc', '18409'],
          ['Xã Thạch Châu', '18583'],
          ['Xã Thạch Kênh', '18586'],
          ['Xã Thạch Kim', '18568'],
          ['Xã Thạch Liên', '18586'],
          ['Xã Thạch Long', '18562'],
          ['Xã Thạch Mỹ', '18583'],
          ['Xã Thạch Ngọc', '18601'],
          ['Xã Thạch Sơn', '18562'],
          ['Xã Thạch Xuân', '18667'],
          ['Xã Thịnh Lộc', '18568'],
          ['Xã Việt Tiến', '18601']
        ]
      },
      {
        oldDistrict: 'Huyện Vũ Quang',
        wards: [
          ['Thị trấn Vũ Quang', '18313'],
          ['Xã Ân Phú', '18322'],
          ['Xã Đức Bồng', '18328'],
          ['Xã Đức Giang', '18322'],
          ['Xã Đức Hương', '18328'],
          ['Xã Đức Liên', '18328'],
          ['Xã Đức Lĩnh', '18322'],
          ['Xã Hương Minh', '18313'],
          ['Xã Quang Thọ', '18313'],
          ['Xã Thọ Điền', '18313']
        ]
      },
      {
        oldDistrict: 'Thành phố Hà Tĩnh',
        wards: [
          ['Phường Bắc Hà', '18073'],
          ['Phường Đại Nài', '18073'],
          ['Phường Đồng Môn', '18100'],
          ['Phường Hà Huy Tập', '18073'],
          ['Phường Nam Hà', '18073'],
          ['Phường Tân Giang', '18073'],
          ['Phường Thạch Hạ', '18100'],
          ['Phường Thạch Hưng', '18073'],
          ['Phường Thạch Quý', '18073'],
          ['Phường Thạch Trung', '18100'],
          ['Phường Trần Phú', '18073'],
          ['Phường Văn Yên', '18073'],
          ['Xã Cẩm Bình', '18685'],
          ['Xã Cẩm Vịnh', '18685'],
          ['Xã Đỉnh Bàn', '18604'],
          ['Xã Hộ Độ', '18100'],
          ['Xã Tân Lâm Hương', '18652'],
          ['Xã Thạch Bình', '18685'],
          ['Xã Thạch Đài', '18652'],
          ['Xã Thạch Hải', '18604'],
          ['Xã Thạch Hội', '18619'],
          ['Xã Thạch Khê', '18604'],
          ['Xã Thạch Lạc', '18628'],
          ['Xã Thạch Thắng', '18628'],
          ['Xã Thạch Trị', '18619'],
          ['Xã Thạch Văn', '18619'],
          ['Xã Tượng Sơn', '18628']
        ]
      },
      {
        oldDistrict: 'Thị xã Hồng Lĩnh',
        wards: [
          ['Phường Bắc Hồng', '18115'],
          ['Phường Đậu Liêu', '18118'],
          ['Phường Đức Thuận', '18115'],
          ['Phường Nam Hồng', '18118'],
          ['Phường Trung Lương', '18115'],
          ['Xã Thuận Lộc', '18118']
        ]
      },
      {
        oldDistrict: 'Thị xã Kỳ Anh',
        wards: [
          ['Phường Hưng Trí', '18754'],
          ['Phường Kỳ Liên', '18832'],
          ['Phường Kỳ Long', '18823'],
          ['Phường Kỳ Nam', '18832'],
          ['Phường Kỳ Ninh', '18781'],
          ['Phường Kỳ Phương', '18832'],
          ['Phường Kỳ Thịnh', '18823'],
          ['Phường Kỳ Trinh', '18754'],
          ['Xã Kỳ Hà', '18781'],
          ['Xã Kỳ Hoa', '18814'],
          ['Xã Kỳ Lợi', '18823']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Hải Dương',
    districts: [
      {
        oldDistrict: 'Huyện Bình Giang',
        wards: [
          ['Thị trấn Kẻ Sặt', '10945'],
          ['Xã Bình Xuyên', '10993'],
          ['Xã Cổ Bì', '10966'],
          ['Xã Hồng Khê', '10966'],
          ['Xã Hùng Thắng', '10945'],
          ['Xã Long Xuyên', '10966'],
          ['Xã Nhân Quyền', '11242'],
          ['Xã Tân Hồng', '10972'],
          ['Xã Tân Việt', '10966'],
          ['Xã Thái Dương', '10993'],
          ['Xã Thái Hòa', '10993'],
          ['Xã Thái Minh', '10972'],
          ['Xã Thúc Kháng', '10972'],
          ['Xã Vĩnh Hồng', '10945'],
          ['Xã Vĩnh Hưng', '10945']
        ]
      },
      {
        oldDistrict: 'Huyện Cẩm Giàng',
        wards: [
          ['Thị trấn Cẩm Giang', '10888'],
          ['Thị trấn Lai Cách', '10891'],
          ['Xã Cao An', '10543'],
          ['Xã Cẩm Đoài', '10891'],
          ['Xã Cẩm Đông', '10930'],
          ['Xã Cẩm Hoàng', '10888'],
          ['Xã Cẩm Hưng', '10903'],
          ['Xã Cẩm Văn', '10909'],
          ['Xã Cẩm Vũ', '10909'],
          ['Xã Định Sơn', '10888'],
          ['Xã Đức Chính', '10909'],
          ['Xã Lương Điền', '10903'],
          ['Xã Ngọc Liên', '10903'],
          ['Xã Phúc Điền', '10930'],
          ['Xã Tân Trường', '10930']
        ]
      },
      {
        oldDistrict: 'Huyện Gia Lộc',
        wards: [
          ['Thị trấn Gia Lộc', '10999'],
          ['Xã Đoàn Thượng', '11050'],
          ['Xã Gia Phúc', '10999'],
          ['Xã Gia Tiến', '10999'],
          ['Xã Hoàng Diệu', '11050'],
          ['Xã Hồng Hưng', '11050'],
          ['Xã Lê Lợi', '11020'],
          ['Xã Nhật Quang', '11065'],
          ['Xã Phạm Trấn', '11065'],
          ['Xã Quang Đức', '11065'],
          ['Xã Thống Kênh', '11050'],
          ['Xã Thống Nhất', '11020'],
          ['Xã Toàn Thắng', '11050'],
          ['Xã Yết Kiêu', '11020']
        ]
      },
      {
        oldDistrict: 'Huyện Kim Thành',
        wards: [
          ['Thị trấn Phú Thái', '10750'],
          ['Xã Đại Đức', '10804'],
          ['Xã Đồng Cẩm', '10804'],
          ['Xã Hòa Bình', '10804'],
          ['Xã Kim Anh', '10750'],
          ['Xã Kim Đính', '10792'],
          ['Xã Kim Liên', '10750'],
          ['Xã Kim Tân', '10792'],
          ['Xã Kim Xuyên', '10750'],
          ['Xã Lai Khê', '10756'],
          ['Xã Ngũ Phúc', '10792'],
          ['Xã Tam Kỳ', '10804'],
          ['Xã Tuấn Việt', '10756'],
          ['Xã Vũ Dũng', '10756']
        ]
      },
      {
        oldDistrict: 'Huyện Nam Sách',
        wards: [
          ['Thị trấn Nam Sách', '10606'],
          ['Xã An Bình', '10645'],
          ['Xã An Phú', '10645'],
          ['Xã An Sơn', '10642'],
          ['Xã Cộng Hòa', '10645'],
          ['Xã Đồng Lạc', '10606'],
          ['Xã Hiệp Cát', '10633'],
          ['Xã Hồng Phong', '10606'],
          ['Xã Hợp Tiến', '10615'],
          ['Xã Minh Tân', '10642'],
          ['Xã Nam Hưng', '10615'],
          ['Xã Nam Tân', '10615'],
          ['Xã Quốc Tuấn', '10633'],
          ['Xã Thái Tân', '10642'],
          ['Xã Trần Phú', '10633']
        ]
      },
      {
        oldDistrict: 'Huyện Ninh Giang',
        wards: [
          ['Thị trấn Ninh Giang', '11203'],
          ['Xã An Đức', '11167'],
          ['Xã Bình Xuyên', '11224'],
          ['Xã Đức Phúc', '11167'],
          ['Xã Hiệp Lực', '11203'],
          ['Xã Hồng Dụ', '11203'],
          ['Xã Hồng Phong', '11224'],
          ['Xã Hưng Long', '11218'],
          ['Xã Kiến Phúc', '11224'],
          ['Xã Nghĩa An', '11164'],
          ['Xã Tân Hương', '11164'],
          ['Xã Tân Phong', '11167'],
          ['Xã Tân Quang', '11218'],
          ['Xã Ứng Hoè', '11164'],
          ['Xã Văn Hội', '11218'],
          ['Xã Vĩnh Hòa', '11203']
        ]
      },
      {
        oldDistrict: 'Huyện Thanh Hà',
        wards: [
          ['Thị trấn Thanh Hà', '10813'],
          ['Xã An Phượng', '10846'],
          ['Xã Cẩm Việt', '10816'],
          ['Xã Hồng Lạc', '10816'],
          ['Xã Liên Mạc', '10843'],
          ['Xã Tân An', '10846'],
          ['Xã Tân Việt', '10816'],
          ['Xã Thanh An', '10843'],
          ['Xã Thanh Hải', '10846'],
          ['Xã Thanh Hồng', '10882'],
          ['Xã Thanh Lang', '10843'],
          ['Xã Thanh Quang', '10882'],
          ['Xã Thanh Sơn', '10813'],
          ['Xã Thanh Tân', '10813'],
          ['Xã Thanh Xuân', '10843'],
          ['Xã Vĩnh Cường', '10882']
        ]
      },
      {
        oldDistrict: 'Huyện Thanh Miện',
        wards: [
          ['Thị trấn Thanh Miện', '11239'],
          ['Xã Cao Thắng', '11239'],
          ['Xã Chi Lăng Bắc', '11284'],
          ['Xã Chi Lăng Nam', '11284'],
          ['Xã Đoàn Kết', '11257'],
          ['Xã Đoàn Tùng', '11242'],
          ['Xã Hồng Phong', '11284'],
          ['Xã Hồng Quang', '11254'],
          ['Xã Lam Sơn', '11254'],
          ['Xã Lê Hồng', '11254'],
          ['Xã Ngô Quyền', '11257'],
          ['Xã Ngũ Hùng', '11239'],
          ['Xã Phạm Kha', '11242'],
          ['Xã Tân Trào', '11257'],
          ['Xã Thanh Giang', '11284'],
          ['Xã Thanh Tùng', '11242'],
          ['Xã Tứ Cường', '11239']
        ]
      },
      {
        oldDistrict: 'Huyện Tứ Kỳ',
        wards: [
          ['Thị trấn Tứ Kỳ', '11074'],
          ['Xã An Thanh', '11131'],
          ['Xã Bình Lăng', '11086'],
          ['Xã Chí Minh', '11131'],
          ['Xã Dân An', '11113'],
          ['Xã Đại Hợp', '11113'],
          ['Xã Đại Sơn', '11086'],
          ['Xã Hà Kỳ', '11146'],
          ['Xã Hà Thanh', '11146'],
          ['Xã Hưng Đạo', '11086'],
          ['Xã Kỳ Sơn', '11113'],
          ['Xã Lạc Phượng', '11140'],
          ['Xã Minh Đức', '11074'],
          ['Xã Nguyên Giáp', '11146'],
          ['Xã Quang Khải', '11074'],
          ['Xã Quang Phục', '11074'],
          ['Xã Quang Trung', '11140'],
          ['Xã Tân Kỳ', '11113'],
          ['Xã Tiên Động', '11140'],
          ['Xã Văn Tố', '11131']
        ]
      },
      {
        oldDistrict: 'Thành phố Chí Linh',
        wards: [
          ['Phường An Lạc', '10603'],
          ['Phường Bến Tắm', '10552'],
          ['Phường Chí Minh', '10549'],
          ['Phường Cổ Thành', '10546'],
          ['Phường Cộng Hoà', '10570'],
          ['Phường Đồng Lạc', '10603'],
          ['Phường Hoàng Tân', '10573'],
          ['Phường Hoàng Tiến', '10573'],
          ['Phường Phả Lại', '10546'],
          ['Phường Sao Đỏ', '10549'],
          ['Phường Tân Dân', '10603'],
          ['Phường Thái Học', '10549'],
          ['Phường Văn An', '10549'],
          ['Phường Văn Đức', '10573'],
          ['Xã Bắc An', '10552'],
          ['Xã Hoàng Hoa Thám', '10552'],
          ['Xã Hưng Đạo', '10570'],
          ['Xã Lê Lợi', '10570'],
          ['Xã Nhân Huệ', '10546']
        ]
      },
      {
        oldDistrict: 'Thành phố Hải Dương',
        wards: [
          ['Phường Ái Quốc', '10660'],
          ['Phường Bình Hàn', '10507'],
          ['Phường Cẩm Thượng', '10507'],
          ['Phường Hải Tân', '10537'],
          ['Phường Lê Thanh Nghị', '10532'],
          ['Phường Nam Đồng', '10837'],
          ['Phường Ngọc Châu', '10525'],
          ['Phường Nguyễn Trãi', '10507'],
          ['Phường Nhị Châu', '10525'],
          ['Phường Quang Trung', '10525'],
          ['Phường Tân Bình', '10532'],
          ['Phường Tân Hưng', '10537'],
          ['Phường Thạch Khôi', '11002'],
          ['Phường Thanh Bình', '10532'],
          ['Phường Trần Hưng Đạo', '10525'],
          ['Phường Trần Phú', '10532'],
          ['Phường Tứ Minh', '10891'],
          ['Phường Việt Hoà', '10543'],
          ['Xã An Thượng', '10507'],
          ['Xã Gia Xuyên', '11002'],
          ['Xã Liên Hồng', '11002'],
          ['Xã Ngọc Sơn', '10537'],
          ['Xã Quyết Thắng', '10660'],
          ['Xã Tiền Tiến', '10837']
        ]
      },
      {
        oldDistrict: 'Thị xã Kinh Môn',
        wards: [
          ['Phường An Lưu', '10675'],
          ['Phường An Phụ', '10729'],
          ['Phường An Sinh', '10726'],
          ['Phường Duy Tân', '10714'],
          ['Phường Hiến Thành', '10744'],
          ['Phường Hiệp An', '10675'],
          ['Phường Hiệp Sơn', '10726'],
          ['Phường Long Xuyên', '10675'],
          ['Phường Minh Tân', '10714'],
          ['Phường Phạm Thái', '10726'],
          ['Phường Phú Thứ', '10714'],
          ['Phường Tân Dân', '10714'],
          ['Phường Thái Thịnh', '10744'],
          ['Phường Thất Hùng', '10678'],
          ['Xã Bạch Đằng', '10678'],
          ['Xã Hiệp Hòa', '10729'],
          ['Xã Lạc Long', '10705'],
          ['Xã Lê Ninh', '10678'],
          ['Xã Minh Hòa', '10744'],
          ['Xã Quang Thành', '10705'],
          ['Xã Thăng Long', '10705'],
          ['Xã Thượng Quận', '10729']
        ]
      }
    ]
  },
  {
    oldProvince: 'Thành phố Hải Phòng',
    districts: [
      {
        oldDistrict: 'Huyện An Lão',
        wards: [
          ['Thị trấn An Lão', '11629'],
          ['Thị trấn Trường Sơn', '11629'],
          ['Xã An Thái', '11674'],
          ['Xã An Thắng', '11629'],
          ['Xã An Thọ', '11674'],
          ['Xã An Tiến', '11629'],
          ['Xã Bát Trang', '11635'],
          ['Xã Chiến Thắng', '11674'],
          ['Xã Mỹ Đức', '11668'],
          ['Xã Quang Hưng', '11647'],
          ['Xã Quang Trung', '11647'],
          ['Xã Quốc Tuấn', '11647'],
          ['Xã Tân Dân', '11629'],
          ['Xã Tân Viên', '11668'],
          ['Xã Thái Sơn', '11668'],
          ['Xã Trường Thành', '11635'],
          ['Xã Trường Thọ', '11635']
        ]
      },
      {
        oldDistrict: 'Huyện Bạch Long Vĩ',
        wards: [['Huyện đảo Bạch Long Vĩ (không chia phường/xã)', '11948']]
      },
      {
        oldDistrict: 'Huyện Cát Hải',
        wards: [
          ['Thị trấn Cát Bà', '11914'],
          ['Thị trấn Cát Hải', '11914'],
          ['Xã Đồng Bài', '11914'],
          ['Xã Gia Luận', '11914'],
          ['Xã Hiền Hào', '11914'],
          ['Xã Hoàng Châu', '11914'],
          ['Xã Nghĩa Lộ', '11914'],
          ['Xã Phù Long', '11914'],
          ['Xã Trân Châu', '11914'],
          ['Xã Văn Phong', '11914'],
          ['Xã Việt Hải', '11914'],
          ['Xã Xuân Đám', '11914']
        ]
      },
      {
        oldDistrict: 'Huyện Kiến Thuỵ',
        wards: [
          ['Thị trấn Núi Đối', '11680'],
          ['Xã Du Lễ', '11713'],
          ['Xã Đại Đồng', '11725'],
          ['Xã Đại Hợp', '11749'],
          ['Xã Đoàn Xá', '11749'],
          ['Xã Đông Phương', '11725'],
          ['Xã Hữu Bằng', '11680'],
          ['Xã Kiến Hưng', '11728'],
          ['Xã Kiến Quốc', '11713'],
          ['Xã Minh Tân', '11725'],
          ['Xã Ngũ Phúc', '11713'],
          ['Xã Tân Phong', '11749'],
          ['Xã Tân Trào', '11728'],
          ['Xã Thanh Sơn', '11680'],
          ['Xã Thuận Thiên', '11680'],
          ['Xã Tú Sơn', '11749']
        ]
      },
      {
        oldDistrict: 'Huyện Tiên Lãng',
        wards: [
          ['Thị trấn Tiên Lãng', '11755'],
          ['Xã Bắc Hưng', '11806'],
          ['Xã Cấp Tiến', '11779'],
          ['Xã Đại Thắng', '11761'],
          ['Xã Đoàn Lập', '11779'],
          ['Xã Đông Hưng', '11806'],
          ['Xã Hùng Thắng', '11809'],
          ['Xã Khởi Nghĩa', '11755'],
          ['Xã Kiến Thiết', '11779'],
          ['Xã Nam Hưng', '11806'],
          ['Xã Quyết Tiến', '11755'],
          ['Xã Tân Minh', '11791'],
          ['Xã Tây Hưng', '11806'],
          ['Xã Tiên Cường', '11761'],
          ['Xã Tiên Minh', '11791'],
          ['Xã Tiên Thanh', '11755'],
          ['Xã Tiên Thắng', '11791'],
          ['Xã Tự Cường', '11761'],
          ['Xã Vinh Quang', '11809']
        ]
      },
      {
        oldDistrict: 'Huyện Vĩnh Bảo',
        wards: [
          ['Thị trấn Vĩnh Bảo', '11824'],
          ['Xã Cao Minh', '11887'],
          ['Xã Dũng Tiến', '11842'],
          ['Xã Giang Biên', '11842'],
          ['Xã Hoà Bình', '11911'],
          ['Xã Hùng Tiến', '11848'],
          ['Xã Liên Am', '11887'],
          ['Xã Lý Học', '11911'],
          ['Xã Tam Cường', '11887'],
          ['Xã Tân Hưng', '11824'],
          ['Xã Tân Liên', '11824'],
          ['Xã Thắng Thuỷ', '11836'],
          ['Xã Tiền Phong', '11875'],
          ['Xã Trấn Dương', '11911'],
          ['Xã Trung Lập', '11836'],
          ['Xã Việt Tiến', '11836'],
          ['Xã Vĩnh An', '11842'],
          ['Xã Vĩnh Hải', '11875'],
          ['Xã Vĩnh Hoà', '11848'],
          ['Xã Vĩnh Hưng', '11824']
        ]
      },
      {
        oldDistrict: 'Quận An Dương',
        wards: [
          ['Phường An Đồng', '11617'],
          ['Phường An Hải', '11581'],
          ['Phường An Hoà', '11593'],
          ['Phường Đồng Thái', '11617'],
          ['Phường Hồng Phong', '11593'],
          ['Phường Hồng Thái', '11617'],
          ['Phường Lê Lợi', '11581'],
          ['Phường Lê Thiện', '11593'],
          ['Phường Nam Sơn', '11581'],
          ['Phường Tân Tiến', '11581']
        ]
      },
      {
        oldDistrict: 'Quận Dương Kinh',
        wards: [
          ['Phường Anh Dũng', '11689'],
          ['Phường Đa Phúc', '11689'],
          ['Phường Hải Thành', '11692'],
          ['Phường Hoà Nghĩa', '11692'],
          ['Phường Hưng Đạo', '11689'],
          ['Phường Tân Thành', '11692']
        ]
      },
      {
        oldDistrict: 'Quận Đồ Sơn',
        wards: [
          ['Phường Bàng La', '11737'],
          ['Phường Hải Sơn', '11455'],
          ['Phường Hợp Đức', '11737'],
          ['Phường Minh Đức', '11737'],
          ['Phường Ngọc Xuyên', '11455'],
          ['Phường Vạn Hương', '11455']
        ]
      },
      {
        oldDistrict: 'Quận Hải An',
        wards: [
          ['Phường Cát Bi', '11413'],
          ['Phường Đằng Hải', '11413'],
          ['Phường Đằng Lâm', '11413'],
          ['Phường Đông Hải 1', '11411'],
          ['Phường Đông Hải 2', '11411'],
          ['Phường Nam Hải', '11411'],
          ['Phường Thành Tô', '11413'],
          ['Phường Tràng Cát', '11413']
        ]
      },
      {
        oldDistrict: 'Quận Hồng Bàng',
        wards: [
          ['Phường An Hồng', '11602'],
          ['Phường An Hưng', '11602'],
          ['Phường Đại Bản', '11602'],
          ['Phường Hoàng Văn Thụ', '11311'],
          ['Phường Hùng Vương', '11311'],
          ['Phường Minh Khai', '11311'],
          ['Phường Phan Bội Châu', '11311'],
          ['Phường Quán Toan', '11602'],
          ['Phường Sở Dầu', '11311'],
          ['Phường Thượng Lý', '11311']
        ]
      },
      {
        oldDistrict: 'Quận Kiến An',
        wards: [
          ['Phường Bắc Hà', '11446'],
          ['Phường Bắc Sơn', '11443'],
          ['Phường Đồng Hoà', '11443'],
          ['Phường Nam Sơn', '11446'],
          ['Phường Ngọc Sơn', '11446'],
          ['Phường Trần Thành Ngọ', '11443'],
          ['Phường Văn Đẩu', '11446']
        ]
      },
      {
        oldDistrict: 'Quận Lê Chân',
        wards: [
          ['Phường An Biên', '11383'],
          ['Phường An Dương', '11407'],
          ['Phường Dư Hàng Kênh', '11383'],
          ['Phường Hàng Kênh', '11383'],
          ['Phường Kênh Dương', '11383'],
          ['Phường Trần Nguyên Hãn', '11383'],
          ['Phường Vĩnh Niệm', '11407']
        ]
      },
      {
        oldDistrict: 'Quận Ngô Quyền',
        wards: [
          ['Phường Cầu Đất', '11359'],
          ['Phường Cầu Tre', '11329'],
          ['Phường Đằng Giang', '11359'],
          ['Phường Đông Khê', '11359'],
          ['Phường Gia Viên', '11329'],
          ['Phường Lạch Tray', '11359'],
          ['Phường Máy Chai', '11329'],
          ['Phường Vạn Mỹ', '11329']
        ]
      },
      {
        oldDistrict: 'Thành phố Thuỷ Nguyên',
        wards: [
          ['Phường An Lư', '11533'],
          ['Phường Dương Quan', '11560'],
          ['Phường Hoà Bình', '11533'],
          ['Phường Hoa Động', '11560'],
          ['Phường Hoàng Lâm', '11557'],
          ['Phường Lập Lễ', '11542'],
          ['Phường Lê Hồng Phong', '11557'],
          ['Phường Lưu Kiếm', '11488'],
          ['Phường Minh Đức', '11473'],
          ['Phường Nam Triệu Giang', '11542'],
          ['Phường Phạm Ngũ Lão', '11473'],
          ['Phường Quảng Thanh', '11506'],
          ['Phường Tam Hưng', '11542'],
          ['Phường Thiên Hương', '11557'],
          ['Phường Thuỷ Đường', '11560'],
          ['Phường Thủy Hà', '11533'],
          ['Phường Trần Hưng Đạo', '11488'],
          ['Xã Bạch Đằng', '11473'],
          ['Xã Liên Xuân', '11488'],
          ['Xã Ninh Sơn', '11503'],
          ['Xã Quang Trung', '11506']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Hậu Giang',
    districts: [
      {
        oldDistrict: 'Huyện Châu Thành',
        wards: [
          ['Thị trấn Mái Dầm', '31366'],
          ['Thị trấn Ngã Sáu', '31366'],
          ['Xã Đông Phú', '31366'],
          ['Xã Đông Phước', '31378'],
          ['Xã Đông Phước A', '31369'],
          ['Xã Đông Thạnh', '31369'],
          ['Xã Phú Hữu', '31378'],
          ['Xã Phú Tân', '31378']
        ]
      },
      {
        oldDistrict: 'Huyện Châu Thành A',
        wards: [
          ['Thị trấn Bảy Ngàn', '31342'],
          ['Thị trấn Cái Tắc', '31369'],
          ['Thị trấn Một Ngàn', '31342'],
          ['Thị trấn Rạch Gòi', '31360'],
          ['Xã Nhơn Nghĩa A', '31342'],
          ['Xã Tân Hoà', '31342'],
          ['Xã Tân Phú Thạnh', '31360'],
          ['Xã Thạnh Xuân', '31360'],
          ['Xã Trường Long A', '31348'],
          ['Xã Trường Long Tây', '31348']
        ]
      },
      {
        oldDistrict: 'Huyện Long Mỹ',
        wards: [
          ['Thị trấn Vĩnh Viễn', '31489'],
          ['Xã Lương Nghĩa', '31492'],
          ['Xã Lương Tâm', '31492'],
          ['Xã Thuận Hòa', '31495'],
          ['Xã Thuận Hưng', '31495'],
          ['Xã Vĩnh Thuận Đông', '31453'],
          ['Xã Vĩnh Viễn A', '31489'],
          ['Xã Xà Phiên', '31495']
        ]
      },
      {
        oldDistrict: 'Huyện Phụng Hiệp',
        wards: [
          ['Thị trấn Búng Tàu', '31432'],
          ['Thị trấn Cây Dương', '31396'],
          ['Thị trấn Kinh Cùng', '31393'],
          ['Xã Bình Thành', '31399'],
          ['Xã Hiệp Hưng', '31396'],
          ['Xã Hòa An', '31393'],
          ['Xã Hòa Mỹ', '31420'],
          ['Xã Long Thạnh', '31408'],
          ['Xã Phụng Hiệp', '31420'],
          ['Xã Phương Bình', '31426'],
          ['Xã Phương Phú', '31426'],
          ['Xã Tân Bình', '31399'],
          ['Xã Tân Long', '31408'],
          ['Xã Tân Phước Hưng', '31432'],
          ['Xã Thạnh Hòa', '31408']
        ]
      },
      {
        oldDistrict: 'Huyện Vị Thuỷ',
        wards: [
          ['Thị trấn Nàng Mau', '31441'],
          ['Xã Vị Bình', '31465'],
          ['Xã Vị Đông', '31465'],
          ['Xã Vị Thanh', '31465'],
          ['Xã Vị Thắng', '31441'],
          ['Xã Vị Thuỷ', '31453'],
          ['Xã Vị Trung', '31441'],
          ['Xã Vĩnh Thuận Tây', '31453'],
          ['Xã Vĩnh Trung', '31459'],
          ['Xã Vĩnh Tường', '31459']
        ]
      },
      {
        oldDistrict: 'Thành phố Ngã Bảy',
        wards: [
          ['Phường Hiệp Lợi', '31411'],
          ['Phường Hiệp Thành', '31340'],
          ['Phường Lái Hiếu', '31340'],
          ['Phường Ngã Bảy', '31340'],
          ['Xã Đại Thành', '31411'],
          ['Xã Tân Thành', '31411']
        ]
      },
      {
        oldDistrict: 'Thành phố Vị Thanh',
        wards: [
          ['Phường I', '31321'],
          ['Phường III', '31321'],
          ['Phường IV', '31333'],
          ['Phường V', '31333'],
          ['Phường VII', '31321'],
          ['Xã Hoả Lựu', '31338'],
          ['Xã Hoả Tiến', '31338'],
          ['Xã Tân Tiến', '31338'],
          ['Xã Vị Tân', '31333']
        ]
      },
      {
        oldDistrict: 'Thị xã Long Mỹ',
        wards: [
          ['Phường Bình Thạnh', '31473'],
          ['Phường Thuận An', '31471'],
          ['Phường Trà Lồng', '31480'],
          ['Phường Vĩnh Tường', '31473'],
          ['Xã Long Bình', '31473'],
          ['Xã Long Phú', '31480'],
          ['Xã Long Trị', '31471'],
          ['Xã Long Trị A', '31471'],
          ['Xã Tân Phú', '31480']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Hoà Bình',
    districts: [
      {
        oldDistrict: 'Huyện Cao Phong',
        wards: [
          ['Thị trấn Cao Phong', '05089'],
          ['Xã Bắc Phong', '05092'],
          ['Xã Bình Thanh', '05092'],
          ['Xã Dũng Phong', '05116'],
          ['Xã Hợp Phong', '05089'],
          ['Xã Nam Phong', '05116'],
          ['Xã Tây Phong', '05116'],
          ['Xã Thạch Yên', '05116'],
          ['Xã Thu Phong', '05089'],
          ['Xã Thung Nai', '05092']
        ]
      },
      {
        oldDistrict: 'Huyện Đà Bắc',
        wards: [
          ['Thị trấn Đà Bắc', '04831'],
          ['Xã Cao Sơn', '04876'],
          ['Xã Đoàn Kết', '04873'],
          ['Xã Đồng Chum', '04849'],
          ['Xã Đồng Ruộng', '04873'],
          ['Xã Giáp Đắt', '04849'],
          ['Xã Hiền Lương', '04831'],
          ['Xã Mường Chiềng', '04846'],
          ['Xã Nánh Nghê', '04846'],
          ['Xã Tân Minh', '04876'],
          ['Xã Tân Pheo', '04849'],
          ['Xã Tiền Phong', '04891'],
          ['Xã Toàn Sơn', '04831'],
          ['Xã Trung Thành', '04873'],
          ['Xã Tú Lý', '04831'],
          ['Xã Vầy Nưa', '04891'],
          ['Xã Yên Hòa', '04873']
        ]
      },
      {
        oldDistrict: 'Huyện Kim Bôi',
        wards: [
          ['Thị trấn Bo', '04978'],
          ['Xã Bình Sơn', '04990'],
          ['Xã Cuối Hạ', '05086'],
          ['Xã Đông Bắc', '05014'],
          ['Xã Đú Sáng', '04990'],
          ['Xã Hợp Tiến', '05014'],
          ['Xã Hùng Sơn', '04990'],
          ['Xã Kim Bôi', '04978'],
          ['Xã Kim Lập', '05068'],
          ['Xã Mi Hòa', '05086'],
          ['Xã Nam Thượng', '05068'],
          ['Xã Nuông Dăm', '05086'],
          ['Xã Sào Báy', '05068'],
          ['Xã Tú Sơn', '05014'],
          ['Xã Vĩnh Đồng', '04978'],
          ['Xã Vĩnh Tiến', '05014'],
          ['Xã Xuân Thủy', '04990']
        ]
      },
      {
        oldDistrict: 'Huyện Lạc Sơn',
        wards: [
          ['Thị trấn Vụ Bản', '05266'],
          ['Xã Ân Nghĩa', '05347'],
          ['Xã Bình Hẻm', '05305'],
          ['Xã Chí Đạo', '05323'],
          ['Xã Định Cư', '05323'],
          ['Xã Hương Nhượng', '05266'],
          ['Xã Miền Đồi', '05293'],
          ['Xã Mỹ Thành', '05290'],
          ['Xã Ngọc Lâu', '05329'],
          ['Xã Ngọc Sơn', '05329'],
          ['Xã Nhân Nghĩa', '05290'],
          ['Xã Quý Hòa', '05287'],
          ['Xã Quyết Thắng', '05323'],
          ['Xã Tân Lập', '05287'],
          ['Xã Tân Mỹ', '05347'],
          ['Xã Thượng Cốc', '05293'],
          ['Xã Tuân Đạo', '05287'],
          ['Xã Tự Do', '05329'],
          ['Xã Văn Nghĩa', '05290'],
          ['Xã Văn Sơn', '05293'],
          ['Xã Vũ Bình', '05266'],
          ['Xã Xuất Hóa', '05305'],
          ['Xã Yên Nghiệp', '05347'],
          ['Xã Yên Phú', '05305']
        ]
      },
      {
        oldDistrict: 'Huyện Lạc Thủy',
        wards: [
          ['Thị trấn Ba Hàng Đồi', '05395'],
          ['Thị trấn Chi Nê', '05392'],
          ['Xã An Bình', '05425'],
          ['Xã Đồng Tâm', '05392'],
          ['Xã Hưng Thi', '05425'],
          ['Xã Khoan Dụ', '05392'],
          ['Xã Phú Nghĩa', '05395'],
          ['Xã Phú Thành', '05395'],
          ['Xã Thống Nhất', '05425'],
          ['Xã Yên Bồng', '05392']
        ]
      },
      {
        oldDistrict: 'Huyện Lương Sơn',
        wards: [
          ['Thị trấn Lương Sơn', '04924'],
          ['Xã Cao Dương', '05047'],
          ['Xã Cao Sơn', '04960'],
          ['Xã Cư Yên', '04960'],
          ['Xã Hòa Sơn', '04924'],
          ['Xã Lâm Sơn', '04924'],
          ['Xã Liên Sơn', '04960'],
          ['Xã Nhuận Trạch', '04924'],
          ['Xã Tân Vinh', '04924'],
          ['Xã Thanh Cao', '05047'],
          ['Xã Thanh Sơn', '05047']
        ]
      },
      {
        oldDistrict: 'Huyện Mai Châu',
        wards: [
          ['Thị trấn Mai Châu', '05200'],
          ['Xã Bao La', '05245'],
          ['Xã Chiềng Châu', '05251'],
          ['Xã Cun Pheo', '05212'],
          ['Xã Đồng Tân', '05200'],
          ['Xã Hang Kia', '05212'],
          ['Xã Mai Hạ', '05251'],
          ['Xã Mai Hịch', '05245'],
          ['Xã Nà Phòn', '05200'],
          ['Xã Pà Cò', '05212'],
          ['Xã Săm Khóe', '05245'],
          ['Xã Sơn Thủy', '05206'],
          ['Xã Tân Thành', '05206'],
          ['Xã Thành Sơn', '05200'],
          ['Xã Tòng Đậu', '05200'],
          ['Xã Vạn Mai', '05251']
        ]
      },
      {
        oldDistrict: 'Huyện Tân Lạc',
        wards: [
          ['Thị trấn Mãn Đức', '05128'],
          ['Xã Đông Lai', '05128'],
          ['Xã Gia Mô', '05191'],
          ['Xã Lỗ Sơn', '05191'],
          ['Xã Mỹ Hòa', '05158'],
          ['Xã Ngọc Mỹ', '05128'],
          ['Xã Ngổ Luông', '05152'],
          ['Xã Nhân Mỹ', '05191'],
          ['Xã Phong Phú', '05158'],
          ['Xã Phú Cường', '05158'],
          ['Xã Phú Vinh', '05134'],
          ['Xã Quyết Chiến', '05152'],
          ['Xã Suối Hoa', '05134'],
          ['Xã Thanh Hối', '05128'],
          ['Xã Tử Nê', '05128'],
          ['Xã Vân Sơn', '05152']
        ]
      },
      {
        oldDistrict: 'Huyện Yên Thủy',
        wards: [
          ['Thị trấn Hàng Trạm', '05353'],
          ['Xã Bảo Hiệu', '05362'],
          ['Xã Đa Phúc', '05362'],
          ['Xã Đoàn Kết', '05386'],
          ['Xã Hữu Lợi', '05386'],
          ['Xã Lạc Lương', '05362'],
          ['Xã Lạc Sỹ', '05362'],
          ['Xã Lạc Thịnh', '05353'],
          ['Xã Ngọc Lương', '05386'],
          ['Xã Phú Lai', '05353'],
          ['Xã Yên Trị', '05386']
        ]
      },
      {
        oldDistrict: 'Thành phố Hòa Bình',
        wards: [
          ['Phường Dân Chủ', '04828'],
          ['Phường Đồng Tiến', '04795'],
          ['Phường Hữu Nghị', '04795'],
          ['Phường Kỳ Sơn', '04894'],
          ['Phường Phương Lâm', '04795'],
          ['Phường Quỳnh Lâm', '04795'],
          ['Phường Tân Hòa', '04792'],
          ['Phường Tân Thịnh', '04795'],
          ['Phường Thái Bình', '04828'],
          ['Phường Thịnh Lang', '04795'],
          ['Phường Thống Nhất', '04828'],
          ['Phường Trung Minh', '04795'],
          ['Xã Độc Lập', '04894'],
          ['Xã Hòa Bình', '04792'],
          ['Xã Hợp Thành', '04897'],
          ['Xã Mông Hóa', '04894'],
          ['Xã Quang Tiến', '04897'],
          ['Xã Thịnh Minh', '04897'],
          ['Xã Yên Mông', '04792']
        ]
      }
    ]
  },
  {
    oldProvince: 'Thành phố Huế',
    districts: [
      {
        oldDistrict: 'Huyện A Lưới',
        wards: [
          ['Thị trấn A Lưới', '20044'],
          ['Xã A Ngo', '20044'],
          ['Xã A Roàng', '20101'],
          ['Xã Đông Sơn', '20101'],
          ['Xã Hồng Bắc', '20044'],
          ['Xã Hồng Hạ', '20050'],
          ['Xã Hồng Kim', '20056'],
          ['Xã Hồng Thái', '20071'],
          ['Xã Hồng Thủy', '20056'],
          ['Xã Hồng Thượng', '20071'],
          ['Xã Hồng Vân', '20056'],
          ['Xã Hương Nguyên', '20050'],
          ['Xã Hương Phong', '20101'],
          ['Xã Lâm Đớt', '20101'],
          ['Xã Phú Vinh', '20071'],
          ['Xã Quảng Nhâm', '20044'],
          ['Xã Sơn Thủy', '20071'],
          ['Xã Trung Sơn', '20056']
        ]
      },
      {
        oldDistrict: 'Huyện Phú Lộc',
        wards: [
          ['Thị trấn Khe Tre', '20161'],
          ['Thị trấn Lăng Cô', '20137'],
          ['Thị trấn Lộc Sơn', '20131'],
          ['Thị trấn Phú Lộc', '20107'],
          ['Xã Giang Hải', '20122'],
          ['Xã Hương Hữu', '20182'],
          ['Xã Hương Lộc', '20161'],
          ['Xã Hương Phú', '20161'],
          ['Xã Hương Sơn', '20179'],
          ['Xã Hương Xuân', '20179'],
          ['Xã Lộc An', '20140'],
          ['Xã Lộc Bình', '20107'],
          ['Xã Lộc Bổn', '20131'],
          ['Xã Lộc Điền', '20140'],
          ['Xã Lộc Hòa', '20140'],
          ['Xã Lộc Thủy', '20137'],
          ['Xã Lộc Tiến', '20137'],
          ['Xã Lộc Trì', '20107'],
          ['Xã Lộc Vĩnh', '20137'],
          ['Xã Thượng Long', '20182'],
          ['Xã Thượng Lộ', '20161'],
          ['Xã Thượng Nhật', '20179'],
          ['Xã Thượng Quảng', '20182'],
          ['Xã Vinh Hiền', '20122'],
          ['Xã Vinh Hưng', '20122'],
          ['Xã Vinh Mỹ', '20122'],
          ['Xã Xuân Lộc', '20131']
        ]
      },
      {
        oldDistrict: 'Huyện Phú Vang',
        wards: [
          ['Thị trấn Phú Đa', '19942'],
          ['Xã Phú An', '19930'],
          ['Xã Phú Diên', '19945'],
          ['Xã Phú Gia', '19942'],
          ['Xã Phú Hải', '19900'],
          ['Xã Phú Hồ', '19918'],
          ['Xã Phú Lương', '19918'],
          ['Xã Phú Mỹ', '19930'],
          ['Xã Phú Thuận', '19900'],
          ['Xã Phú Xuân', '19918'],
          ['Xã Vinh An', '19945'],
          ['Xã Vinh Hà', '19942'],
          ['Xã Vinh Thanh', '19945'],
          ['Xã Vinh Xuân', '19945']
        ]
      },
      {
        oldDistrict: 'Huyện Quảng Điền',
        wards: [
          ['Thị trấn Sịa', '19867'],
          ['Xã Quảng An', '19867'],
          ['Xã Quảng Công', '19873'],
          ['Xã Quảng Lợi', '19885'],
          ['Xã Quảng Ngạn', '19873'],
          ['Xã Quảng Phú', '19885'],
          ['Xã Quảng Phước', '19867'],
          ['Xã Quảng Thái', '19885'],
          ['Xã Quảng Thành', '20014'],
          ['Xã Quảng Thọ', '19867'],
          ['Xã Quảng Vinh', '19885']
        ]
      },
      {
        oldDistrict: 'Quận Phú Xuân',
        wards: [
          ['Phường An Hòa', '19804'],
          ['Phường Đông Ba', '19753'],
          ['Phường Gia Hội', '19753'],
          ['Phường Hương An', '19804'],
          ['Phường Hương Long', '19774'],
          ['Phường Hương Sơ', '19804'],
          ['Phường Hương Vinh', '20014'],
          ['Phường Kim Long', '19774'],
          ['Phường Long Hồ', '19774'],
          ['Phường Phú Hậu', '19753'],
          ['Phường Tây Lộc', '19753'],
          ['Phường Thuận Hòa', '19753'],
          ['Phường Thuận Lộc', '19753']
        ]
      },
      {
        oldDistrict: 'Quận Thuận Hóa',
        wards: [
          ['Phường An Cựu', '19815'],
          ['Phường An Đông', '19815'],
          ['Phường An Tây', '19815'],
          ['Phường Dương Nỗ', '19909'],
          ['Phường Hương Phong', '20014'],
          ['Phường Phú Hội', '19789'],
          ['Phường Phú Nhuận', '19789'],
          ['Phường Phú Thượng', '19930'],
          ['Phường Phước Vĩnh', '19789'],
          ['Phường Phường Đúc', '19789'],
          ['Phường Thuận An', '19900'],
          ['Phường Thủy Bằng', '19813'],
          ['Phường Thuỷ Biều', '19813'],
          ['Phường Thủy Vân', '19777'],
          ['Phường Thuỷ Xuân', '19813'],
          ['Phường Trường An', '19789'],
          ['Phường Vĩnh Ninh', '19789'],
          ['Phường Vỹ Dạ', '19777'],
          ['Phường Xuân Phú', '19777']
        ]
      },
      {
        oldDistrict: 'Thị xã Hương Thủy',
        wards: [
          ['Phường Phú Bài', '19960'],
          ['Phường Thủy Châu', '19975'],
          ['Phường Thủy Dương', '19969'],
          ['Phường Thủy Lương', '19975'],
          ['Phường Thủy Phương', '19969'],
          ['Xã Dương Hòa', '19960'],
          ['Xã Phú Sơn', '19960'],
          ['Xã Thủy Phù', '19960'],
          ['Xã Thủy Tân', '19975'],
          ['Xã Thủy Thanh', '19969']
        ]
      },
      {
        oldDistrict: 'Thị xã Hương Trà',
        wards: [
          ['Phường Hương Chữ', '20017'],
          ['Phường Hương Văn', '19996'],
          ['Phường Hương Vân', '19996'],
          ['Phường Hương Xuân', '20017'],
          ['Phường Tứ Hạ', '19996'],
          ['Xã Bình Thành', '20035'],
          ['Xã Bình Tiến', '20035'],
          ['Xã Hương Bình', '20035'],
          ['Xã Hương Toàn', '20017']
        ]
      },
      {
        oldDistrict: 'Thị xã Phong Điền',
        wards: [
          ['Phường Phong An', '19858'],
          ['Phường Phong Hải', '19873'],
          ['Phường Phong Hiền', '19858'],
          ['Phường Phong Hòa', '19831'],
          ['Phường Phong Phú', '19828'],
          ['Phường Phong Thu', '19819'],
          ['Xã Phong Bình', '19831'],
          ['Xã Phong Chương', '19831'],
          ['Xã Phong Mỹ', '19819'],
          ['Xã Phong Sơn', '19858'],
          ['Xã Phong Thạnh', '19828'],
          ['Xã Phong Xuân', '19819']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Hưng Yên',
    districts: [
      {
        oldDistrict: 'Huyện Ân Thi',
        wards: [
          ['Thị trấn Ân Thi', '12142'],
          ['Xã Bãi Sậy', '12148'],
          ['Xã Bắc Sơn', '12148'],
          ['Xã Cẩm Ninh', '12184'],
          ['Xã Đa Lộc', '12184'],
          ['Xã Đào Dương', '12148'],
          ['Xã Đặng Lễ', '12184'],
          ['Xã Hạ Lễ', '12196'],
          ['Xã Hoàng Hoa Thám', '12142'],
          ['Xã Hồ Tùng Mậu', '12196'],
          ['Xã Hồng Quang', '12196'],
          ['Xã Nguyễn Trãi', '12184'],
          ['Xã Phù Ủng', '12148'],
          ['Xã Quảng Lãng', '12166'],
          ['Xã Quang Vinh', '12142'],
          ['Xã Tiền Phong', '12196'],
          ['Xã Vân Du', '12166'],
          ['Xã Xuân Trúc', '12166']
        ]
      },
      {
        oldDistrict: 'Huyện Khoái Châu',
        wards: [
          ['Thị trấn Khoái Châu', '12205'],
          ['Xã An Vĩ', '12223'],
          ['Xã Bình Minh', '12049'],
          ['Xã Chí Minh', '12271'],
          ['Xã Dân Tiến', '12238'],
          ['Xã Đại Tập', '12247'],
          ['Xã Đông Kết', '12205'],
          ['Xã Đông Ninh', '12247'],
          ['Xã Đông Tảo', '12070'],
          ['Xã Đồng Tiến', '12238'],
          ['Xã Liên Khê', '12205'],
          ['Xã Nguyễn Huệ', '12271'],
          ['Xã Ông Đình', '12223'],
          ['Xã Phạm Hồng Thái', '12223'],
          ['Xã Phùng Hưng', '12205'],
          ['Xã Tân Châu', '12247'],
          ['Xã Tân Dân', '12223'],
          ['Xã Thuần Hưng', '12271'],
          ['Xã Tứ Dân', '12247'],
          ['Xã Việt Hòa', '12238']
        ]
      },
      {
        oldDistrict: 'Huyện Kim Động',
        wards: [
          ['Thị trấn Lương Bằng', '12280'],
          ['Xã Chính Nghĩa', '12280'],
          ['Xã Diên Hồng', '12280'],
          ['Xã Đồng Thanh', '12286'],
          ['Xã Đức Hợp', '12313'],
          ['Xã Hiệp Cường', '12322'],
          ['Xã Hùng An', '12322'],
          ['Xã Mai Động', '12313'],
          ['Xã Nghĩa Dân', '12286'],
          ['Xã Ngọc Thanh', '12322'],
          ['Xã Phạm Ngũ Lão', '12280'],
          ['Xã Phú Thọ', '12313'],
          ['Xã Song Mai', '12322'],
          ['Xã Toàn Thắng', '12286'],
          ['Xã Vĩnh Xá', '12286']
        ]
      },
      {
        oldDistrict: 'Huyện Phù Cừ',
        wards: [
          ['Thị trấn Trần Cao', '12391'],
          ['Xã Đình Cao', '12424'],
          ['Xã Đoàn Đào', '12406'],
          ['Xã Minh Hoàng', '12406'],
          ['Xã Minh Tân', '12391'],
          ['Xã Nguyên Hòa', '12427'],
          ['Xã Nhật Quang', '12424'],
          ['Xã Phan Sào Nam', '12406'],
          ['Xã Quang Hưng', '12391'],
          ['Xã Tam Đa', '12427'],
          ['Xã Tiên Tiến', '12424'],
          ['Xã Tống Phan', '12391'],
          ['Xã Tống Trân', '12427']
        ]
      },
      {
        oldDistrict: 'Huyện Tiên Lữ',
        wards: [
          ['Thị trấn Vương', '12337'],
          ['Xã An Viên', '12337'],
          ['Xã Cương Chính', '12361'],
          ['Xã Hải Thắng', '12364'],
          ['Xã Hưng Đạo', '12337'],
          ['Xã Lệ Xá', '12361'],
          ['Xã Nhật Tân', '12337'],
          ['Xã Thiện Phiến', '12364'],
          ['Xã Thủ Sỹ', '11977'],
          ['Xã Thụy Lôi', '12364'],
          ['Xã Trung Dũng', '12361']
        ]
      },
      {
        oldDistrict: 'Huyện Văn Giang',
        wards: [
          ['Thị trấn Văn Giang', '12019'],
          ['Xã Cửu Cao', '12025'],
          ['Xã Liên Nghĩa', '12019'],
          ['Xã Long Hưng', '12031'],
          ['Xã Mễ Sở', '12049'],
          ['Xã Nghĩa Trụ', '12031'],
          ['Xã Phụng Công', '12025'],
          ['Xã Tân Tiến', '12019'],
          ['Xã Thắng Lợi', '12049'],
          ['Xã Vĩnh Khúc', '12031'],
          ['Xã Xuân Quan', '12025']
        ]
      },
      {
        oldDistrict: 'Huyện Văn Lâm',
        wards: [
          ['Thị trấn Như Quỳnh', '12004'],
          ['Xã Chỉ Đạo', '11992'],
          ['Xã Đại Đồng', '11995'],
          ['Xã Đình Dù', '12004'],
          ['Xã Lạc Đạo', '11992'],
          ['Xã Lạc Hồng', '12004'],
          ['Xã Lương Tài', '11995'],
          ['Xã Minh Hải', '11992'],
          ['Xã Tân Quang', '12004'],
          ['Xã Trưng Trắc', '12004'],
          ['Xã Việt Hưng', '11995']
        ]
      },
      {
        oldDistrict: 'Huyện Yên Mỹ',
        wards: [
          ['Thị trấn Yên Mỹ', '12073'],
          ['Xã Đồng Than', '12070'],
          ['Xã Hoàn Long', '12070'],
          ['Xã Liêu Xá', '12064'],
          ['Xã Ngọc Long', '12064'],
          ['Xã Nguyễn Văn Linh', '12064'],
          ['Xã Tân Lập', '12073'],
          ['Xã Tân Minh', '12073'],
          ['Xã Thanh Long', '12091'],
          ['Xã Trung Hòa', '12073'],
          ['Xã Việt Yên', '12091'],
          ['Xã Yên Phú', '12091']
        ]
      },
      {
        oldDistrict: 'Thành phố Hưng Yên',
        wards: [
          ['Phường An Tảo', '11953'],
          ['Phường Hiến Nam', '11953'],
          ['Phường Hồng Châu', '11980'],
          ['Phường Lam Sơn', '11983'],
          ['Phường Lê Lợi', '11953'],
          ['Phường Minh Khai', '11953'],
          ['Xã Bảo Khê', '11983'],
          ['Xã Hoàng Hanh', '11980'],
          ['Xã Hùng Cường', '11983'],
          ['Xã Liên Phương', '11953'],
          ['Xã Phú Cường', '11983'],
          ['Xã Phương Nam', '11977'],
          ['Xã Quảng Châu', '11980'],
          ['Xã Tân Hưng', '11977'],
          ['Xã Trung Nghĩa', '11953']
        ]
      },
      {
        oldDistrict: 'Thị xã Mỹ Hào',
        wards: [
          ['Phường Bạch Sam', '12127'],
          ['Phường Bần Yên Nhân', '12103'],
          ['Phường Dị Sử', '12133'],
          ['Phường Minh Đức', '12127'],
          ['Phường Nhân Hòa', '12103'],
          ['Phường Phan Đình Phùng', '12103'],
          ['Phường Phùng Chí Kiên', '12133'],
          ['Xã Cẩm Xá', '12103'],
          ['Xã Dương Quang', '12127'],
          ['Xã Hòa Phong', '12127'],
          ['Xã Hưng Long', '12133'],
          ['Xã Ngọc Lâm', '12133'],
          ['Xã Xuân Dục', '12133']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Khánh Hòa',
    districts: [
      {
        oldDistrict: 'Huyện Cam Lâm',
        wards: [
          ['Thị trấn Cam Đức', '22453'],
          ['Xã Cam An Bắc', '22465'],
          ['Xã Cam An Nam', '22465'],
          ['Xã Cam Hải Đông', '22453'],
          ['Xã Cam Hải Tây', '22453'],
          ['Xã Cam Hiệp Bắc', '22435'],
          ['Xã Cam Hiệp Nam', '22435'],
          ['Xã Cam Hòa', '22708'],
          ['Xã Cam Phước Tây', '22465'],
          ['Xã Cam Tân', '22435'],
          ['Xã Cam Thành Bắc', '22453'],
          ['Xã Sơn Tân', '22435'],
          ['Xã Suối Cát', '22708'],
          ['Xã Suối Tân', '22708']
        ]
      },
      {
        oldDistrict: 'Huyện Diên Khánh',
        wards: [
          ['Thị trấn Diên Khánh', '22651'],
          ['Xã Bình Lộc', '22702'],
          ['Xã Diên An', '22651'],
          ['Xã Diên Điền', '22657'],
          ['Xã Diên Hòa', '22678'],
          ['Xã Diên Lạc', '22678'],
          ['Xã Diên Lâm', '22660'],
          ['Xã Diên Phú', '22657'],
          ['Xã Diên Phước', '22672'],
          ['Xã Diên Sơn', '22657'],
          ['Xã Diên Tân', '22672'],
          ['Xã Diên Thạnh', '22678'],
          ['Xã Diên Thọ', '22672'],
          ['Xã Diên Toàn', '22651'],
          ['Xã Suối Hiệp', '22702'],
          ['Xã Suối Tiên', '22702'],
          ['Xã Xuân Đồng', '22660']
        ]
      },
      {
        oldDistrict: 'Huyện Khánh Sơn',
        wards: [
          ['Thị trấn Tô Hạp', '22714'],
          ['Xã Ba Cụm Bắc', '22732'],
          ['Xã Ba Cụm Nam', '22732'],
          ['Xã Sơn Bình', '22714'],
          ['Xã Sơn Hiệp', '22714'],
          ['Xã Sơn Lâm', '22720'],
          ['Xã Sơn Trung', '22732'],
          ['Xã Thành Sơn', '22720']
        ]
      },
      {
        oldDistrict: 'Huyện Khánh Vĩnh',
        wards: [
          ['Thị trấn Khánh Vĩnh', '22609'],
          ['Xã Cầu Bà', '22648'],
          ['Xã Giang Ly', '22624'],
          ['Xã Khánh Bình', '22615'],
          ['Xã Khánh Đông', '22615'],
          ['Xã Khánh Hiệp', '22612'],
          ['Xã Khánh Nam', '22624'],
          ['Xã Khánh Phú', '22609'],
          ['Xã Khánh Thành', '22648'],
          ['Xã Khánh Thượng', '22624'],
          ['Xã Khánh Trung', '22612'],
          ['Xã Liên Sang', '22648'],
          ['Xã Sông Cầu', '22609'],
          ['Xã Sơn Thái', '22648']
        ]
      },
      {
        oldDistrict: 'Huyện Trường Sa',
        wards: [
          ['Thị trấn Trường Sa', '22736'],
          ['Xã Sinh Tồn', '22736'],
          ['Xã Song Tử Tây', '22736']
        ]
      },
      {
        oldDistrict: 'Huyện Vạn Ninh',
        wards: [
          ['Thị trấn Vạn Giã', '22489'],
          ['Xã Đại Lãnh', '22504'],
          ['Xã Vạn Bình', '22516'],
          ['Xã Vạn Hưng', '22525'],
          ['Xã Vạn Khánh', '22498'],
          ['Xã Vạn Long', '22498'],
          ['Xã Vạn Lương', '22489'],
          ['Xã Vạn Phú', '22489'],
          ['Xã Vạn Phước', '22498'],
          ['Xã Vạn Thạnh', '22504'],
          ['Xã Vạn Thắng', '22516'],
          ['Xã Vạn Thọ', '22504'],
          ['Xã Xuân Sơn', '22525']
        ]
      },
      {
        oldDistrict: 'Thành phố Cam Ranh',
        wards: [
          ['Phường Ba Ngòi', '22423'],
          ['Phường Cam Linh', '22432'],
          ['Phường Cam Lộc', '22420'],
          ['Phường Cam Lợi', '22432'],
          ['Phường Cam Nghĩa', '22411'],
          ['Phường Cam Phú', '22420'],
          ['Phường Cam Phúc Bắc', '22411'],
          ['Phường Cam Phúc Nam', '22420'],
          ['Phường Cam Thuận', '22432'],
          ['Xã Cam Bình', '22480'],
          ['Xã Cam Lập', '22480'],
          ['Xã Cam Phước Đông', '22423'],
          ['Xã Cam Thành Nam', '22411'],
          ['Xã Cam Thịnh Đông', '22480'],
          ['Xã Cam Thịnh Tây', '22480']
        ]
      },
      {
        oldDistrict: 'Thành phố Nha Trang',
        wards: [
          ['Phường Lộc Thọ', '22366'],
          ['Phường Ngọc Hiệp', '22390'],
          ['Phường Phước Hải', '22402'],
          ['Phường Phước Hòa', '22366'],
          ['Phường Phước Long', '22402'],
          ['Phường Phương Sài', '22390'],
          ['Phường Tân Tiến', '22366'],
          ['Phường Vạn Thạnh', '22366'],
          ['Phường Vĩnh Hải', '22333'],
          ['Phường Vĩnh Hòa', '22333'],
          ['Phường Vĩnh Nguyên', '22366'],
          ['Phường Vĩnh Phước', '22333'],
          ['Phường Vĩnh Thọ', '22333'],
          ['Phường Vĩnh Trường', '22402'],
          ['Xã Phước Đồng', '22402'],
          ['Xã Vĩnh Hiệp', '22390'],
          ['Xã Vĩnh Lương', '22333'],
          ['Xã Vĩnh Ngọc', '22390'],
          ['Xã Vĩnh Phương', '22333'],
          ['Xã Vĩnh Thái', '22402'],
          ['Xã Vĩnh Thạnh', '22390'],
          ['Xã Vĩnh Trung', '22390']
        ]
      },
      {
        oldDistrict: 'Thị xã Ninh Hòa',
        wards: [
          ['Phường Ninh Diêm', '22561'],
          ['Phường Ninh Đa', '22528'],
          ['Phường Ninh Giang', '22591'],
          ['Phường Ninh Hà', '22591'],
          ['Phường Ninh Hải', '22561'],
          ['Phường Ninh Hiệp', '22528'],
          ['Phường Ninh Thủy', '22561'],
          ['Xã Ninh An', '22546'],
          ['Xã Ninh Bình', '22576'],
          ['Xã Ninh Đông', '22528'],
          ['Xã Ninh Hưng', '22597'],
          ['Xã Ninh Ích', '22597'],
          ['Xã Ninh Lộc', '22597'],
          ['Xã Ninh Phú', '22591'],
          ['Xã Ninh Phụng', '22528'],
          ['Xã Ninh Phước', '22561'],
          ['Xã Ninh Quang', '22576'],
          ['Xã Ninh Sim', '22552'],
          ['Xã Ninh Sơn', '22546'],
          ['Xã Ninh Tân', '22597'],
          ['Xã Ninh Tây', '22552'],
          ['Xã Ninh Thân', '22558'],
          ['Xã Ninh Thọ', '22546'],
          ['Xã Ninh Thượng', '22558'],
          ['Xã Ninh Trung', '22558'],
          ['Xã Ninh Xuân', '22576']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Kiên Giang',
    districts: [
      {
        oldDistrict: 'Huyện An Biên',
        wards: [
          ['Thị trấn Thứ Ba', '30985'],
          ['Xã Đông Thái', '31006'],
          ['Xã Đông Yên', '30985'],
          ['Xã Hưng Yên', '30985'],
          ['Xã Nam Thái', '31006'],
          ['Xã Nam Thái A', '31006'],
          ['Xã Nam Yên', '30988'],
          ['Xã Tây Yên', '30988'],
          ['Xã Tây Yên A', '30988']
        ]
      },
      {
        oldDistrict: 'Huyện An Minh',
        wards: [
          ['Thị trấn Thứ Mười Một', '31018'],
          ['Xã Đông Hòa', '31024'],
          ['Xã Đông Hưng', '31018'],
          ['Xã Đông Hưng A', '31036'],
          ['Xã Đông Hưng B', '31018'],
          ['Xã Đông Thạnh', '31024'],
          ['Xã Tân Thạnh', '31031'],
          ['Xã Thuận Hoà', '31031'],
          ['Xã Vân Khánh', '31042'],
          ['Xã Vân Khánh Đông', '31036'],
          ['Xã Vân Khánh Tây', '31042']
        ]
      },
      {
        oldDistrict: 'Huyện Châu Thành',
        wards: [
          ['Thị trấn Minh Lương', '30880'],
          ['Xã Bình An', '30898'],
          ['Xã Giục Tượng', '30880'],
          ['Xã Minh Hòa', '30880'],
          ['Xã Mong Thọ', '30886'],
          ['Xã Mong Thọ A', '30886'],
          ['Xã Mong Thọ B', '30886'],
          ['Xã Thạnh Lộc', '30910'],
          ['Xã Vĩnh Hòa Hiệp', '30898'],
          ['Xã Vĩnh Hoà Phú', '30898']
        ]
      },
      {
        oldDistrict: 'Huyện Giang Thành',
        wards: [
          ['Xã Phú Lợi', '30796'],
          ['Xã Phú Mỹ', '30796'],
          ['Xã Tân Khánh Hòa', '30796'],
          ['Xã Vĩnh Điều', '30793'],
          ['Xã Vĩnh Phú', '30793']
        ]
      },
      {
        oldDistrict: 'Huyện Giồng Riềng',
        wards: [
          ['Thị trấn Giồng Riềng', '30904'],
          ['Xã Bàn Tân Định', '30904'],
          ['Xã Bàn Thạch', '30904'],
          ['Xã Hoà An', '30934'],
          ['Xã Hòa Hưng', '30934'],
          ['Xã Hoà Lợi', '30934'],
          ['Xã Hòa Thuận', '30949'],
          ['Xã Long Thạnh', '30943'],
          ['Xã Ngọc Chúc', '30928'],
          ['Xã Ngọc Hoà', '30949'],
          ['Xã Ngọc Thành', '30928'],
          ['Xã Ngọc Thuận', '30928'],
          ['Xã Thạnh Bình', '30904'],
          ['Xã Thạnh Hòa', '30904'],
          ['Xã Thạnh Hưng', '30910'],
          ['Xã Thạnh Lộc', '30886'],
          ['Xã Thạnh Phước', '30910'],
          ['Xã Vĩnh Phú', '30943'],
          ['Xã Vĩnh Thạnh', '30943']
        ]
      },
      {
        oldDistrict: 'Huyện Gò Quao',
        wards: [
          ['Thị trấn Gò Quao', '30952'],
          ['Xã Định An', '30952'],
          ['Xã Định Hòa', '30958'],
          ['Xã Thới Quản', '30958'],
          ['Xã Thủy Liễu', '30958'],
          ['Xã Vĩnh Hòa Hưng Bắc', '30970'],
          ['Xã Vĩnh Hòa Hưng Nam', '30970'],
          ['Xã Vĩnh Phước A', '30982'],
          ['Xã Vĩnh Phước B', '30952'],
          ['Xã Vĩnh Thắng', '30982'],
          ['Xã Vĩnh Tuy', '30982']
        ]
      },
      {
        oldDistrict: 'Huyện Hòn Đất',
        wards: [
          ['Thị trấn Hòn Đất', '30817'],
          ['Thị trấn Sóc Sơn', '30838'],
          ['Xã Bình Giang', '30826'],
          ['Xã Bình Sơn', '30823'],
          ['Xã Lình Huỳnh', '30817'],
          ['Xã Mỹ Hiệp Sơn', '30838'],
          ['Xã Mỹ Lâm', '30760'],
          ['Xã Mỹ Phước', '30838'],
          ['Xã Mỹ Thái', '30835'],
          ['Xã Mỹ Thuận', '30838'],
          ['Xã Nam Thái Sơn', '30817'],
          ['Xã Sơn Bình', '30835'],
          ['Xã Sơn Kiên', '30835'],
          ['Xã Thổ Sơn', '30817']
        ]
      },
      {
        oldDistrict: 'Huyện Kiên Hải',
        wards: [
          ['Xã An Sơn', '31108'],
          ['Xã Hòn Tre', '31108'],
          ['Xã Lại Sơn', '31108'],
          ['Xã Nam Du', '31108']
        ]
      },
      {
        oldDistrict: 'Huyện Kiên Lương',
        wards: [
          ['Thị trấn Kiên Lương', '30787'],
          ['Xã Bình An', '30787'],
          ['Xã Bình Trị', '30787'],
          ['Xã Dương Hòa', '30766'],
          ['Xã Hòa Điền', '30790'],
          ['Xã Hòn Nghệ', '30814'],
          ['Xã Kiên Bình', '30790'],
          ['Xã Sơn Hải', '30811']
        ]
      },
      {
        oldDistrict: 'Huyện Tân Hiệp',
        wards: [
          ['Thị trấn Tân Hiệp', '30850'],
          ['Xã Tân An', '30856'],
          ['Xã Tân Hiệp A', '30874'],
          ['Xã Tân Hiệp B', '30850'],
          ['Xã Tân Hoà', '30856'],
          ['Xã Tân Hội', '30856'],
          ['Xã Tân Thành', '30856'],
          ['Xã Thạnh Đông', '30850'],
          ['Xã Thạnh Đông A', '30874'],
          ['Xã Thạnh Đông B', '30850'],
          ['Xã Thạnh Trị', '30874']
        ]
      },
      {
        oldDistrict: 'Huyện U Minh Thượng',
        wards: [
          ['Xã An Minh Bắc', '31027'],
          ['Xã Hoà Chánh', '31012'],
          ['Xã Minh Thuận', '31027'],
          ['Xã Thạnh Yên', '31012'],
          ['Xã Thạnh Yên A', '31012'],
          ['Xã Vĩnh Hòa', '31012']
        ]
      },
      {
        oldDistrict: 'Huyện Vĩnh Thuận',
        wards: [
          ['Thị trấn Vĩnh Thuận', '31051'],
          ['Xã Bình Minh', '31064'],
          ['Xã Phong Đông', '31051'],
          ['Xã Tân Thuận', '31069'],
          ['Xã Vĩnh Bình Bắc', '31064'],
          ['Xã Vĩnh Bình Nam', '31064'],
          ['Xã Vĩnh Phong', '31051'],
          ['Xã Vĩnh Thuận', '31069']
        ]
      },
      {
        oldDistrict: 'Thành phố Hà Tiên',
        wards: [
          ['Phường Bình San', '30769'],
          ['Phường Đông Hồ', '30769'],
          ['Phường Mỹ Đức', '30769'],
          ['Phường Pháo Đài', '30769'],
          ['Phường Tô Châu', '30766'],
          ['Xã Thuận Yên', '30766'],
          ['Xã Tiên Hải', '30781']
        ]
      },
      {
        oldDistrict: 'Thành phố Phú Quốc',
        wards: [
          ['Phường An Thới', '31078'],
          ['Phường Dương Đông', '31078'],
          ['Xã Bãi Thơm', '31078'],
          ['Xã Cửa Cạn', '31078'],
          ['Xã Cửa Dương', '31078'],
          ['Xã Dương Tơ', '31078'],
          ['Xã Gành Dầu', '31078'],
          ['Xã Hàm Ninh', '31078'],
          ['Xã Thổ Châu', '31105']
        ]
      },
      {
        oldDistrict: 'Thành phố Rạch Giá',
        wards: [
          ['Phường An Bình', '30742'],
          ['Phường An Hòa', '30742'],
          ['Phường Rạch Sỏi', '30742'],
          ['Phường Vĩnh Hiệp', '30742'],
          ['Phường Vĩnh Lạc', '30742'],
          ['Phường Vĩnh Lợi', '30742'],
          ['Phường Vĩnh Quang', '30742'],
          ['Phường Vĩnh Thanh', '30742'],
          ['Phường Vĩnh Thanh Vân', '30742'],
          ['Phường Vĩnh Thông', '30760'],
          ['Xã Phi Thông', '30760']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Kon Tum',
    districts: [
      {
        oldDistrict: 'Huyện Đắk Glei',
        wards: [
          ['Thị trấn Đắk Glei', '23341'],
          ['Xã Đắk Blô', '23344'],
          ['Xã Đắk Choong', '23356'],
          ['Xã Đắk KRoong', '23374'],
          ['Xã Đắk Long', '23368'],
          ['Xã Đắk Man', '23344'],
          ['Xã Đắk Môn', '23374'],
          ['Xã Đắk Nhoong', '23344'],
          ['Xã Đắk Pék', '23341'],
          ['Xã Mường Hoong', '23365'],
          ['Xã Ngọc Linh', '23365'],
          ['Xã Xốp', '23356']
        ]
      },
      {
        oldDistrict: 'Huyện Đắk Hà',
        wards: [
          ['Thị trấn Đắk Hà', '23500'],
          ['Xã Đắk HRing', '23512'],
          ['Xã Đắk La', '23500'],
          ['Xã Đăk Long', '23504'],
          ['Xã Đắk Mar', '23512'],
          ['Xã Đăk Ngọk', '23510'],
          ['Xã Đắk PXi', '23504'],
          ['Xã Đắk Ui', '23510'],
          ['Xã Hà Mòn', '23500'],
          ['Xã Ngok Réo', '23515'],
          ['Xã Ngok Wang', '23515']
        ]
      },
      {
        oldDistrict: 'Huyện Đắk Tô',
        wards: [
          ['Thị trấn Đắk Tô', '23401'],
          ['Xã Diên Bình', '23401'],
          ['Xã Đắk Rơ Nga', '23428'],
          ['Xã Đắk Trăm', '23430'],
          ['Xã Kon Đào', '23430'],
          ['Xã Ngọk Tụ', '23428'],
          ['Xã Pô Kô', '23401'],
          ['Xã Tân Cảnh', '23401'],
          ['Xã Văn Lem', '23430']
        ]
      },
      {
        oldDistrict: "Huyện Ia H' Drai",
        wards: [
          ['Xã Ia Dom', '23538'],
          ['Xã Ia Đal', '23535'],
          ['Xã Ia Tơi', '23538']
        ]
      },
      {
        oldDistrict: 'Huyện Kon Plông',
        wards: [
          ['Thị trấn Măng Đen', '23473'],
          ['Xã Đắk Nên', '23455'],
          ['Xã Đắk Ring', '23455'],
          ['Xã Đắk Tăng', '23473'],
          ['Xã Hiếu', '23476'],
          ['Xã Măng Buk', '23455'],
          ['Xã Măng Cành', '23473'],
          ['Xã Ngok Tem', '23476'],
          ['Xã Pờ Ê', '23476']
        ]
      },
      {
        oldDistrict: 'Huyện Kon Rẫy',
        wards: [
          ['Thị trấn Đắk Rve', '23479'],
          ['Xã Đắk Kôi', '23485'],
          ['Xã Đắk Pne', '23479'],
          ['Xã Đắk Ruồng', '23497'],
          ['Xã Đắk Tơ Lung', '23485'],
          ['Xã Đắk Tờ Re', '23497'],
          ['Xã Tân Lập', '23497']
        ]
      },
      {
        oldDistrict: 'Huyện Ngọc Hồi',
        wards: [
          ['Thị trấn Plei Kần', '23377'],
          ['Xã Bờ Y', '23377'],
          ['Xã Đắk Ang', '23383'],
          ['Xã Đắk Dục', '23383'],
          ['Xã Đắk Kan', '23392'],
          ['Xã Đắk Nông', '23383'],
          ['Xã Đắk Xú', '23377'],
          ['Xã Sa Loong', '23392']
        ]
      },
      {
        oldDistrict: 'Huyện Sa Thầy',
        wards: [
          ['Thị trấn Sa Thầy', '23527'],
          ['Xã Hơ Moong', '23534'],
          ['Xã Mô Rai', '23536'],
          ['Xã Rơ Kơi', '23530'],
          ['Xã Sa Bình', '23534'],
          ['Xã Sa Nghĩa', '23534'],
          ['Xã Sa Nhơn', '23527'],
          ['Xã Sa Sơn', '23527'],
          ['Xã Ya ly', '23548'],
          ['Xã Ya Tăng', '23548'],
          ['Xã Ya Xiêr', '23548']
        ]
      },
      {
        oldDistrict: 'Huyện Tu Mơ Rông',
        wards: [
          ['Xã Đắk Hà', '23425'],
          ['Xã Đắk Na', '23416'],
          ['Xã Đắk Rơ Ông', '23419'],
          ['Xã Đắk Sao', '23416'],
          ['Xã Đắk Tờ Kan', '23419'],
          ['Xã Măng Ri', '23446'],
          ['Xã Ngọc Lây', '23446'],
          ['Xã Ngọc Yêu', '23446'],
          ['Xã Tê Xăng', '23446'],
          ['Xã Tu Mơ Rông', '23425'],
          ['Xã Văn Xuôi', '23446']
        ]
      },
      {
        oldDistrict: 'Thành phố Kon Tum',
        wards: [
          ['Phường Duy Tân', '23284'],
          ['Phường Lê Lợi', '23302'],
          ['Phường Ngô Mây', '23284'],
          ['Phường Nguyễn Trãi', '23302'],
          ['Phường Quang Trung', '23293'],
          ['Phường Quyết Thắng', '23293'],
          ['Phường Thắng Lợi', '23293'],
          ['Phường Thống Nhất', '23293'],
          ['Phường Trần Hưng Đạo', '23302'],
          ['Phường Trường Chinh', '23293'],
          ['Xã Chư Hreng', '23332'],
          ['Xã Đắk Blà', '23332'],
          ['Xã Đắk Cấm', '23284'],
          ['Xã Đăk Năng', '23326'],
          ['Xã Đắk Rơ Wa', '23332'],
          ['Xã Đoàn Kết', '23326'],
          ['Xã Hòa Bình', '23332'],
          ['Xã Ia Chim', '23326'],
          ['Xã Kroong', '23317'],
          ['Xã Ngọk Bay', '23317'],
          ['Xã Vinh Quang', '23317']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Lai Châu',
    districts: [
      {
        oldDistrict: 'Huyện Mường Tè',
        wards: [
          ['Thị trấn Mường Tè', '03433'],
          ['Xã Bum Nưa', '03466'],
          ['Xã Bum Tở', '03433'],
          ['Xã Ka Lăng', '03439'],
          ['Xã Kan Hồ', '03433'],
          ['Xã Mù Cả', '03451'],
          ['Xã Mường Tè', '03445'],
          ['Xã Nậm Khao', '03445'],
          ['Xã Pa ủ', '03442'],
          ['Xã Pa Vệ Sử', '03466'],
          ['Xã Tá Bạ', '03442'],
          ['Xã Tà Tổng', '03463'],
          ['Xã Thu Lũm', '03439'],
          ['Xã Vàng San', '03460']
        ]
      },
      {
        oldDistrict: 'Huyện Nậm Nhùn',
        wards: [
          ['Thị trấn Nậm Nhùn', '03434'],
          ['Xã Hua Bun', '03460'],
          ['Xã Lê Lợi', '03487'],
          ['Xã Mường Mô', '03472'],
          ['Xã Nậm Ban', '03503'],
          ['Xã Nậm Chà', '03472'],
          ['Xã Nậm Hàng', '03434'],
          ['Xã Nậm Manh', '03434'],
          ['Xã Nậm Pì', '03487'],
          ['Xã Pú Đao', '03487'],
          ['Xã Trung Chải', '03503']
        ]
      },
      {
        oldDistrict: 'Huyện Phong Thổ',
        wards: [
          ['Thị trấn Phong Thổ', '03549'],
          ['Xã Bản Lang', '03583'],
          ['Xã Dào San', '03571'],
          ['Xã Hoang Thèn', '03583'],
          ['Xã Huổi Luông', '03549'],
          ['Xã Khổng Lào', '03583'],
          ['Xã Lả Nhì Thàng', '03388'],
          ['Xã Ma Ly Pho', '03549'],
          ['Xã Mồ Sì San', '03562'],
          ['Xã Mù Sang', '03571'],
          ['Xã Mường So', '03549'],
          ['Xã Nậm Xe', '03394'],
          ['Xã Pa Vây Sử', '03562'],
          ['Xã Sì Lở Lầu', '03562'],
          ['Xã Sin Suối Hồ', '03394'],
          ['Xã Tông Qua Lìn', '03571'],
          ['Xã Vàng Ma Chải', '03562']
        ]
      },
      {
        oldDistrict: 'Huyện Sìn Hồ',
        wards: [
          ['Thị trấn Sìn Hồ', '03478'],
          ['Xã Căn Co', '03538'],
          ['Xã Chăn Nưa', '03487'],
          ['Xã Hồng Thu', '03508'],
          ['Xã Làng Mô', '03529'],
          ['Xã Lùng Thàng', '03517'],
          ['Xã Ma Quai', '03508'],
          ['Xã Nậm Cha', '03517'],
          ['Xã Nậm Cuổi', '03544'],
          ['Xã Nậm Hăn', '03544'],
          ['Xã Nậm Mạ', '03538'],
          ['Xã Nậm Tăm', '03517'],
          ['Xã Noong Hẻo', '03532'],
          ['Xã Pa Khoá', '03532'],
          ['Xã Pa Tần', '03503'],
          ['Xã Phăng Sô Lin', '03478'],
          ['Xã Phìn Hồ', '03508'],
          ['Xã Pu Sam Cáp', '03532'],
          ['Xã Sà Dề Phìn', '03478'],
          ['Xã Tả Ngảo', '03529'],
          ['Xã Tả Phìn', '03478'],
          ['Xã Tủa Sín Chải', '03529']
        ]
      },
      {
        oldDistrict: 'Huyện Tam Đường',
        wards: [
          ['Thị trấn Tam Đường', '03390'],
          ['Xã Bản Bo', '03424'],
          ['Xã Bản Giang', '03408'],
          ['Xã Bản Hon', '03430'],
          ['Xã Bình Lư', '03390'],
          ['Xã Giang Ma', '03405'],
          ['Xã Hồ Thầu', '03405'],
          ['Xã Khun Há', '03430'],
          ['Xã Nà Tăm', '03424'],
          ['Xã Nùng Nàng', '03408'],
          ['Xã Sơn Bình', '03390'],
          ['Xã Tả Lèng', '03405'],
          ['Xã Thèn Sin', '03394']
        ]
      },
      {
        oldDistrict: 'Huyện Tân Uyên',
        wards: [
          ['Thị trấn Tân Uyên', '03598'],
          ['Xã Hố Mít', '03616'],
          ['Xã Mường Khoa', '03601'],
          ['Xã Nậm Cần', '03598'],
          ['Xã Nậm Sỏ', '03613'],
          ['Xã Pắc Ta', '03616'],
          ['Xã Phúc Khoa', '03601'],
          ['Xã Tà Mít', '03613'],
          ['Xã Thân Thuộc', '03598'],
          ['Xã Trung Đồng', '03598']
        ]
      },
      {
        oldDistrict: 'Huyện Than Uyên',
        wards: [
          ['Thị trấn Than Uyên', '03595'],
          ['Xã Hua Nà', '03595'],
          ['Xã Khoen On', '03640'],
          ['Xã Mường Cang', '03595'],
          ['Xã Mường Kim', '03637'],
          ['Xã Mường Mít', '03618'],
          ['Xã Mường Than', '03595'],
          ['Xã Pha Mu', '03637'],
          ['Xã Phúc Than', '03618'],
          ['Xã Tà Gia', '03640'],
          ['Xã Tà Hừa', '03637'],
          ['Xã Tà Mung', '03637']
        ]
      },
      {
        oldDistrict: 'Thành phố Lai Châu',
        wards: [
          ['Phường Đoàn Kết', '03388'],
          ['Phường Đông Phong', '03408'],
          ['Phường Quyết Thắng', '03388'],
          ['Phường Quyết Tiến', '03388'],
          ['Phường Tân Phong', '03408'],
          ['Xã San Thàng', '03408'],
          ['Xã Sùng Phài', '03388']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Lạng Sơn',
    districts: [
      {
        oldDistrict: 'Huyện Bắc Sơn',
        wards: [
          ['Thị trấn Bắc Sơn', '06325'],
          ['Xã Bắc Quỳnh', '06325'],
          ['Xã Chiến Thắng', '06364'],
          ['Xã Chiêu Vũ', '06367'],
          ['Xã Đồng ý', '06337'],
          ['Xã Hưng Vũ', '06349'],
          ['Xã Long Đống', '06325'],
          ['Xã Nhất Hòa', '06376'],
          ['Xã Nhất Tiến', '06376'],
          ['Xã Tân Hương', '06367'],
          ['Xã Tân Lập', '06367'],
          ['Xã Tân Thành', '06376'],
          ['Xã Tân Tri', '06337'],
          ['Xã Trấn Yên', '06349'],
          ['Xã Vạn Thủy', '06337'],
          ['Xã Vũ Lăng', '06367'],
          ['Xã Vũ Lễ', '06364'],
          ['Xã Vũ Sơn', '06364']
        ]
      },
      {
        oldDistrict: 'Huyện Bình Gia',
        wards: [
          ['Thị trấn Bình Gia', '06112'],
          ['Xã Bình La', '06115'],
          ['Xã Hòa Bình', '06103'],
          ['Xã Hoa Thám', '06073'],
          ['Xã Hoàng Văn Thụ', '06112'],
          ['Xã Hồng Phong', '06079'],
          ['Xã Hồng Thái', '06115'],
          ['Xã Hưng Đạo', '06073'],
          ['Xã Minh Khai', '06079'],
          ['Xã Mông Ân', '06112'],
          ['Xã Quang Trung', '06091'],
          ['Xã Quý Hòa', '06076'],
          ['Xã Tân Hòa', '06103'],
          ['Xã Tân Văn', '06115'],
          ['Xã Thiện Hòa', '06085'],
          ['Xã Thiện Long', '06103'],
          ['Xã Thiện Thuật', '06091'],
          ['Xã Vĩnh Yên', '06076'],
          ['Xã Yên Lỗ', '06085']
        ]
      },
      {
        oldDistrict: 'Huyện Cao Lộc',
        wards: [
          ['Thị trấn Cao Lộc', '06187'],
          ['Thị trấn Đồng Đăng', '06184'],
          ['Xã Bảo Lâm', '06184'],
          ['Xã Bình Trung', '06286'],
          ['Xã Cao Lâu', '06196'],
          ['Xã Công Sơn', '06220'],
          ['Xã Gia Cát', '06187'],
          ['Xã Hải Yến', '06220'],
          ['Xã Hòa Cư', '06220'],
          ['Xã Hồng Phong', '06184'],
          ['Xã Hợp Thành', '06187'],
          ['Xã Lộc Yên', '06211'],
          ['Xã Mẫu Sơn', '06196'],
          ['Xã Phú Xá', '06184'],
          ['Xã Tân Liên', '06187'],
          ['Xã Tân Thành', '06316'],
          ['Xã Thạch Đạn', '06211'],
          ['Xã Thanh Lòa', '06211'],
          ['Xã Thụy Hùng', '06184'],
          ['Xã Xuân Long', '06286'],
          ['Xã Xuất Lễ', '06196'],
          ['Xã Yên Trạch', '05977']
        ]
      },
      {
        oldDistrict: 'Huyện Chi Lăng',
        wards: [
          ['Thị trấn Chi Lăng', '06463'],
          ['Thị trấn Đồng Mỏ', '06463'],
          ['Xã Bắc Thủy', '06496'],
          ['Xã Bằng Hữu', '06475'],
          ['Xã Bằng Mạc', '06475'],
          ['Xã Chi Lăng', '06463'],
          ['Xã Chiến Thắng', '06481'],
          ['Xã Gia Lộc', '06475'],
          ['Xã Hòa Bình', '06505'],
          ['Xã Hữu Kiên', '06517'],
          ['Xã Lâm Sơn', '06496'],
          ['Xã Liên Sơn', '06481'],
          ['Xã Mai Sao', '06496'],
          ['Xã Nhân Lý', '06496'],
          ['Xã Quan Sơn', '06517'],
          ['Xã Thượng Cường', '06475'],
          ['Xã Vạn Linh', '06505'],
          ['Xã Vân An', '06481'],
          ['Xã Vân Thủy', '06481'],
          ['Xã Y Tịch', '06505']
        ]
      },
      {
        oldDistrict: 'Huyện Đình Lập',
        wards: [
          ['Thị trấn Đình Lập', '06613'],
          ['Thị trấn Thái Bình', '06616'],
          ['Xã Bắc Lãng', '06637'],
          ['Xã Bắc Xa', '06625'],
          ['Xã Bính Xá', '06625'],
          ['Xã Châu Sơn', '06637'],
          ['Xã Cường Lợi', '06637'],
          ['Xã Đình Lập', '06613'],
          ['Xã Đồng Thắng', '06637'],
          ['Xã Kiên Mộc', '06625'],
          ['Xã Lâm Ca', '06616'],
          ['Xã Thái Bình', '06616']
        ]
      },
      {
        oldDistrict: 'Huyện Hữu Lũng',
        wards: [
          ['Thị trấn Hữu Lũng', '06385'],
          ['Xã Cai Kinh', '06427'],
          ['Xã Đồng Tân', '06385'],
          ['Xã Đồng Tiến', '06436'],
          ['Xã Hòa Bình', '06391'],
          ['Xã Hòa Lạc', '06445'],
          ['Xã Hòa Sơn', '06445'],
          ['Xã Hòa Thắng', '06457'],
          ['Xã Hồ Sơn', '06385'],
          ['Xã Hữu Liên', '06400'],
          ['Xã Minh Hòa', '06457'],
          ['Xã Minh Sơn', '06457'],
          ['Xã Minh Tiến', '06415'],
          ['Xã Nhật Tiến', '06415'],
          ['Xã Quyết Thắng', '06391'],
          ['Xã Tân Thành', '06445'],
          ['Xã Thanh Sơn', '06436'],
          ['Xã Thiện Tân', '06436'],
          ['Xã Vân Nham', '06415'],
          ['Xã Yên Bình', '06391'],
          ['Xã Yên Sơn', '06427'],
          ['Xã Yên Thịnh', '06400'],
          ['Xã Yên Vượng', '06427']
        ]
      },
      {
        oldDistrict: 'Huyện Lộc Bình',
        wards: [
          ['Thị trấn Lộc Bình', '06529'],
          ['Thị trấn Na Dương', '06526'],
          ['Xã Ái Quốc', '06607'],
          ['Xã Đồng Bục', '06529'],
          ['Xã Đông Quan', '06526'],
          ['Xã Hữu Khánh', '06529'],
          ['Xã Hữu Lân', '06577'],
          ['Xã Khánh Xuân', '06529'],
          ['Xã Khuất Xá', '06565'],
          ['Xã Lợi Bác', '06601'],
          ['Xã Mẫu Sơn', '06541'],
          ['Xã Minh Hiệp', '06577'],
          ['Xã Nam Quan', '06607'],
          ['Xã Sàn Viên', '06601'],
          ['Xã Tam Gia', '06565'],
          ['Xã Thống Nhất', '06577'],
          ['Xã Tú Đoạn', '06526'],
          ['Xã Tú Mịch', '06541'],
          ['Xã Xuân Dương', '06607'],
          ['Xã Yên Khoái', '06541']
        ]
      },
      {
        oldDistrict: 'Huyện Tràng Định',
        wards: [
          ['Thị trấn Thất Khê', '06040'],
          ['Xã Cao Minh', '06001'],
          ['Xã Chi Lăng', '06040'],
          ['Xã Chí Minh', '06040'],
          ['Xã Đào Viên', '06058'],
          ['Xã Đề Thám', '06046'],
          ['Xã Đoàn Kết', '06001'],
          ['Xã Đội Cấn', '06004'],
          ['Xã Hùng Sơn', '06046'],
          ['Xã Hùng Việt', '06046'],
          ['Xã Kháng Chiến', '06037'],
          ['Xã Khánh Long', '06001'],
          ['Xã Kim Đồng', '06019'],
          ['Xã Quốc Khánh', '06004'],
          ['Xã Quốc Việt', '06058'],
          ['Xã Tân Minh', '06037'],
          ['Xã Tân Tiến', '06019'],
          ['Xã Tân Yên', '06019'],
          ['Xã Tri Phương', '06004'],
          ['Xã Trung Thành', '06037']
        ]
      },
      {
        oldDistrict: 'Huyện Văn Lãng',
        wards: [
          ['Thị trấn Na Sầm', '06124'],
          ['Xã Bắc Hùng', '06124'],
          ['Xã Bắc La', '06154'],
          ['Xã Bắc Việt', '06154'],
          ['Xã Gia Miễn', '06151'],
          ['Xã Hoàng Văn Thụ', '06172'],
          ['Xã Hoàng Việt', '06124'],
          ['Xã Hội Hoan', '06151'],
          ['Xã Hồng Thái', '06172'],
          ['Xã Nhạc Kỳ', '06172'],
          ['Xã Tân Mỹ', '06172'],
          ['Xã Tân Tác', '06154'],
          ['Xã Tân Thanh', '06172'],
          ['Xã Thành Hòa', '06154'],
          ['Xã Thanh Long', '06148'],
          ['Xã Thụy Hùng', '06148'],
          ['Xã Trùng Khánh', '06148']
        ]
      },
      {
        oldDistrict: 'Huyện Văn Quan',
        wards: [
          ['Thị trấn Văn Quan', '06253'],
          ['Xã An Sơn', '06298'],
          ['Xã Bình Phúc', '06298'],
          ['Xã Điềm He', '06280'],
          ['Xã Hòa Bình', '06253'],
          ['Xã Hữu Lễ', '06313'],
          ['Xã Khánh Khê', '06286'],
          ['Xã Liên Hội', '06280'],
          ['Xã Lương Năng', '06313'],
          ['Xã Tân Đoàn', '06316'],
          ['Xã Tràng Phái', '06316'],
          ['Xã Trấn Ninh', '06280'],
          ['Xã Tri Lễ', '06313'],
          ['Xã Tú Xuyên', '06253'],
          ['Xã Yên Phúc', '06298']
        ]
      },
      {
        oldDistrict: 'Thành phố Lạng Sơn',
        wards: [
          ['Phường Chi Lăng', '05983'],
          ['Phường Đông Kinh', '05977'],
          ['Phường Hoàng Văn Thụ', '06187'],
          ['Phường Tam Thanh', '05986'],
          ['Phường Vĩnh Trại', '05977'],
          ['Xã Hoàng Đồng', '05986'],
          ['Xã Mai Pha', '05977'],
          ['Xã Quảng Lạc', '05983']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Lào Cai',
    districts: [
      {
        oldDistrict: 'Huyện Bảo Thắng',
        wards: [
          ['Thị trấn N.T Phong Hải', '02902'],
          ['Thị trấn Phố Lu', '02905'],
          ['Thị trấn Tằng Loỏng', '02908'],
          ['Xã Bản Cầm', '02902'],
          ['Xã Bản Phiệt', '02647'],
          ['Xã Gia Phú', '02923'],
          ['Xã Phong Niên', '02926'],
          ['Xã Phú Nhuận', '02908'],
          ['Xã Sơn Hà', '02905'],
          ['Xã Sơn Hải', '02905'],
          ['Xã Thái Niên', '02905'],
          ['Xã Trì Quang', '02926'],
          ['Xã Xuân Giao', '02923'],
          ['Xã Xuân Quang', '02926']
        ]
      },
      {
        oldDistrict: 'Huyện Bảo Yên',
        wards: [
          ['Thị trấn Phố Ràng', '02947'],
          ['Xã Bảo Hà', '02989'],
          ['Xã Cam Cọn', '02989'],
          ['Xã Điện Quan', '02968'],
          ['Xã Kim Sơn', '02989'],
          ['Xã Lương Sơn', '02947'],
          ['Xã Minh Tân', '02968'],
          ['Xã Nghĩa Đô', '02953'],
          ['Xã Phúc Khánh', '02998'],
          ['Xã Tân Dương', '02962'],
          ['Xã Tân Tiến', '02953'],
          ['Xã Thượng Hà', '02968'],
          ['Xã Việt Tiến', '02998'],
          ['Xã Vĩnh Yên', '02953'],
          ['Xã Xuân Hoà', '02962'],
          ['Xã Xuân Thượng', '02947'],
          ['Xã Yên Sơn', '02947']
        ]
      },
      {
        oldDistrict: 'Huyện Bát Xát',
        wards: [
          ['Thị trấn Bát Xát', '02683'],
          ['Xã A Lù', '02701'],
          ['Xã A Mú Sung', '02686'],
          ['Xã Bản Qua', '02683'],
          ['Xã Bản Vược', '02683'],
          ['Xã Bản Xèo', '02725'],
          ['Xã Cốc Mỳ', '02695'],
          ['Xã Dền Sáng', '02707'],
          ['Xã Dền Thàng', '02707'],
          ['Xã Mường Hum', '02728'],
          ['Xã Mường Vi', '02725'],
          ['Xã Nậm Chạc', '02686'],
          ['Xã Nậm Pung', '02728'],
          ['Xã Pa Cheo', '02725'],
          ['Xã Phìn Ngan', '02683'],
          ['Xã Quang Kim', '02683'],
          ['Xã Sàng Ma Sáo', '02707'],
          ['Xã Tòng Sành', '02746'],
          ['Xã Trịnh Tường', '02695'],
          ['Xã Trung Lèng Hồ', '02728'],
          ['Xã Y Tý', '02701']
        ]
      },
      {
        oldDistrict: 'Huyện Bắc Hà',
        wards: [
          ['Thị trấn Bắc Hà', '02839'],
          ['Xã Bản Cái', '02896'],
          ['Xã Bản Liền', '02869'],
          ['Xã Bản Phố', '02839'],
          ['Xã Bảo Nhai', '02890'],
          ['Xã Cốc Lầu', '02896'],
          ['Xã Cốc Ly', '02890'],
          ['Xã Hoàng Thu Phố', '02839'],
          ['Xã Lùng Cải', '02842'],
          ['Xã Lùng Phình', '02848'],
          ['Xã Na Hối', '02839'],
          ['Xã Nậm Đét', '02890'],
          ['Xã Nậm Khánh', '02869'],
          ['Xã Nậm Lúc', '02896'],
          ['Xã Nậm Mòn', '02839'],
          ['Xã Tả Củ Tỷ', '02842'],
          ['Xã Tả Van Chư', '02848'],
          ['Xã Thải Giàng Phố', '02839']
        ]
      },
      {
        oldDistrict: 'Huyện Mường Khương',
        wards: [
          ['Thị trấn Mường Khương', '02761'],
          ['Xã Bản Lầu', '02788'],
          ['Xã Bản Sen', '02788'],
          ['Xã Cao Sơn', '02782'],
          ['Xã Dìn Chin', '02752'],
          ['Xã La Pan Tẩn', '02782'],
          ['Xã Lùng Khấu Nhin', '02782'],
          ['Xã Lùng Vai', '02788'],
          ['Xã Nậm Chảy', '02761'],
          ['Xã Nấm Lư', '02761'],
          ['Xã Pha Long', '02752'],
          ['Xã Tả Gia Khâu', '02752'],
          ['Xã Tả Ngải Chồ', '02752'],
          ['Xã Tả Thàng', '02782'],
          ['Xã Thanh Bình', '02761'],
          ['Xã Tung Chung Phố', '02761']
        ]
      },
      {
        oldDistrict: 'Huyện Si Ma Cai',
        wards: [
          ['Thị trấn Si Ma Cai', '02809'],
          ['Xã Bản Mế', '02824'],
          ['Xã Cán Cấu', '02809'],
          ['Xã Lùng Thẩn', '02848'],
          ['Xã Nàn Sán', '02809'],
          ['Xã Nàn Xín', '02824'],
          ['Xã Quan Hồ Thẩn', '02809'],
          ['Xã Sán Chải', '02809'],
          ['Xã Sín Chéng', '02824'],
          ['Xã Thào Chư Phìn', '02824']
        ]
      },
      {
        oldDistrict: 'Huyện Văn Bàn',
        wards: [
          ['Thị trấn Khánh Yên', '03082'],
          ['Xã Chiềng Ken', '03091'],
          ['Xã Dần Thàng', '03076'],
          ['Xã Dương Quỳ', '03106'],
          ['Xã Hoà Mạc', '03082'],
          ['Xã Khánh Yên Hạ', '03103'],
          ['Xã Khánh Yên Thượng', '03082'],
          ['Xã Khánh Yên Trung', '03103'],
          ['Xã Làng Giàng', '03082'],
          ['Xã Liêm Phú', '03103'],
          ['Xã Minh Lương', '03121'],
          ['Xã Nậm Chầy', '03076'],
          ['Xã Nậm Mả', '03061'],
          ['Xã Nậm Rạng', '03061'],
          ['Xã Nậm Tha', '03091'],
          ['Xã Nậm Xây', '03121'],
          ['Xã Nậm Xé', '03085'],
          ['Xã Sơn Thuỷ', '03082'],
          ['Xã Tân An', '02989'],
          ['Xã Tân Thượng', '02989'],
          ['Xã Thẩm Dương', '03106'],
          ['Xã Võ Lao', '03061']
        ]
      },
      {
        oldDistrict: 'Thành phố Lào Cai',
        wards: [
          ['Phường Bắc Cường', '02671'],
          ['Phường Bắc Lệnh', '02671'],
          ['Phường Bình Minh', '02671'],
          ['Phường Cốc Lếu', '02647'],
          ['Phường Duyên Hải', '02647'],
          ['Phường Kim Tân', '02647'],
          ['Phường Lào Cai', '02647'],
          ['Phường Nam Cường', '02671'],
          ['Phường Pom Hán', '02671'],
          ['Phường Xuân Tăng', '02671'],
          ['Xã Cam Đường', '02671'],
          ['Xã Cốc San', '02746'],
          ['Xã Đồng Tuyển', '02746'],
          ['Xã Hợp Thành', '02680'],
          ['Xã Tả Phời', '02680'],
          ['Xã Thống Nhất', '02923'],
          ['Xã Vạn Hoà', '02647']
        ]
      },
      {
        oldDistrict: 'Thị xã Sa Pa',
        wards: [
          ['Phường Cầu Mây', '03006'],
          ['Phường Hàm Rồng', '03006'],
          ['Phường Ô Quý Hồ', '03006'],
          ['Phường Phan Si Păng', '03006'],
          ['Phường Sa Pả', '03006'],
          ['Phường Sa Pa', '03006'],
          ['Xã Bản Hồ', '03046'],
          ['Xã Hoàng Liên', '03037'],
          ['Xã Liên Minh', '03043'],
          ['Xã Mường Bo', '03043'],
          ['Xã Mường Hoa', '03037'],
          ['Xã Ngũ Chỉ Sơn', '03004'],
          ['Xã Tả Phìn', '03013'],
          ['Xã Tả Van', '03037'],
          ['Xã Thanh Bình', '03046'],
          ['Xã Trung Chải', '03013']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Lâm Đồng',
    districts: [
      {
        oldDistrict: 'Huyện Bảo Lâm',
        wards: [
          ['Thị trấn Lộc Thắng', '25054'],
          ["Xã B' Lá", '25063'],
          ['Xã Lộc An', '25084'],
          ['Xã Lộc Bảo', '25057'],
          ['Xã Lộc Bắc', '25057'],
          ['Xã Lộc Đức', '25084'],
          ['Xã Lộc Lâm', '25063'],
          ['Xã Lộc Nam', '25093'],
          ['Xã Lộc Ngãi', '25054'],
          ['Xã Lộc Phú', '25063'],
          ['Xã Lộc Quảng', '25054'],
          ['Xã Lộc Tân', '24820'],
          ['Xã Lộc Thành', '25093'],
          ['Xã Tân Lạc', '25084']
        ]
      },
      {
        oldDistrict: 'Huyện Di Linh',
        wards: [
          ['Thị trấn Di Linh', '25000'],
          ['Xã Bảo Thuận', '25018'],
          ['Xã Đinh Lạc', '25018'],
          ['Xã Đinh Trang Hòa', '25036'],
          ['Xã Đinh Trang Thượng', '25007'],
          ['Xã Gia Bắc', '25051'],
          ['Xã Gia Hiệp', '25015'],
          ['Xã Gung Ré', '25000'],
          ['Xã Hòa Bắc', '25042'],
          ['Xã Hòa Nam', '25042'],
          ['Xã Hòa Ninh', '25036'],
          ['Xã Hòa Trung', '25036'],
          ['Xã Liên Đầm', '25000'],
          ['Xã Sơn Điền', '25051'],
          ['Xã Tam Bố', '25015'],
          ['Xã Tân Châu', '25000'],
          ['Xã Tân Lâm', '25007'],
          ['Xã Tân Nghĩa', '25018'],
          ['Xã Tân Thượng', '25007']
        ]
      },
      {
        oldDistrict: 'Huyện Đạ Tẻh',
        wards: [
          ['Thị trấn Cát Tiên', '25159'],
          ["Thị trấn Đạ M'ri", '25105'],
          ['Thị trấn Đạ Tẻh', '25126'],
          ['Thị trấn Ma Đa Guôi', '25099'],
          ['Thị trấn Phước Cát', '25180'],
          ['Xã An Nhơn', '25126'],
          ['Xã Bà Gia', '25114'],
          ['Xã Đạ Kho', '25138'],
          ['Xã Đạ Lây', '25126'],
          ['Xã Đạ Oai', '25099'],
          ['Xã Đạ Pal', '25138'],
          ['Xã Đồng Nai Thượng', '25162'],
          ['Xã Đức Phổ', '25180'],
          ['Xã Gia Viễn', '25162'],
          ['Xã Hà Lâm', '25105'],
          ['Xã Ma Đa Guôi', '25099'],
          ['Xã Mỹ Đức', '25135'],
          ['Xã Nam Ninh', '25159'],
          ['Xã Phước Cát 2', '25180'],
          ['Xã Quảng Ngãi', '25159'],
          ['Xã Quảng Trị', '25138'],
          ['Xã Quốc Oai', '25135'],
          ['Xã Tiên Hoàng', '25162']
        ]
      },
      {
        oldDistrict: 'Huyện Đam Rông',
        wards: [
          ["Xã Đạ K' Nàng", '24886'],
          ['Xã Đạ Long', '24853'],
          ["Xã Đạ M' Rong", '24875'],
          ['Xã Đạ Rsal', '24875'],
          ['Xã Đạ Tông', '24853'],
          ['Xã Liêng Srônh', '24877'],
          ['Xã Phi Liêng', '24886'],
          ['Xã Rô Men', '24877']
        ]
      },
      {
        oldDistrict: 'Huyện Đơn Dương',
        wards: [
          ["Thị trấn D'Ran", '24934'],
          ['Thị trấn Thạnh Mỹ', '24931'],
          ['Xã Đạ Ròn', '24931'],
          ['Xã Ka Đô', '24943'],
          ['Xã Ka Đơn', '24955'],
          ['Xã Lạc Lâm', '24943'],
          ['Xã Lạc Xuân', '24934'],
          ['Xã Quảng Lập', '24955'],
          ['Xã Tu Tra', '24931']
        ]
      },
      {
        oldDistrict: 'Huyện Đức Trọng',
        wards: [
          ['Thị trấn Liên Nghĩa', '24958'],
          ['Xã Bình Thạnh', '24871'],
          ['Xã Đà Loan', '24991'],
          ['Xã Đa Quyn', '24988'],
          ['Xã Hiệp An', '24967'],
          ['Xã Hiệp Thạnh', '24967'],
          ['Xã Liên Hiệp', '24967'],
          ["Xã N'Thol Hạ", '24976'],
          ['Xã Ninh Gia', '24985'],
          ['Xã Ninh Loan', '24991'],
          ['Xã Phú Hội', '24958'],
          ['Xã Tà Hine', '24991'],
          ['Xã Tà Năng', '24988'],
          ['Xã Tân Hội', '24976'],
          ['Xã Tân Thành', '24976']
        ]
      },
      {
        oldDistrict: 'Huyện Lạc Dương',
        wards: [
          ['Thị trấn Lạc Dương', '24846'],
          ['Xã Đạ Chais', '24848'],
          ['Xã Đạ Nhim', '24848'],
          ['Xã Đạ Sar', '24848'],
          ['Xã Đưng KNớ', '24853'],
          ['Xã Lát', '24846']
        ]
      },
      {
        oldDistrict: 'Huyện Lâm Hà',
        wards: [
          ['Thị trấn Đinh Văn', '24871'],
          ['Thị trấn Nam Ban', '24868'],
          ['Xã Đạ Đờn', '24895'],
          ['Xã Đan Phượng', '24916'],
          ['Xã Đông Thanh', '24868'],
          ['Xã Gia Lâm', '24868'],
          ['Xã Hoài Đức', '24916'],
          ['Xã Liên Hà', '24916'],
          ['Xã Mê Linh', '24868'],
          ['Xã Nam Hà', '24883'],
          ['Xã Phi Tô', '24883'],
          ['Xã Phú Sơn', '24895'],
          ['Xã Phúc Thọ', '24907'],
          ['Xã Tân Hà', '24916'],
          ['Xã Tân Thanh', '24907'],
          ['Xã Tân Văn', '24871']
        ]
      },
      {
        oldDistrict: 'Thành phố Bảo Lộc',
        wards: [
          ['Phường 1', '24823'],
          ['Phường 2', '24820'],
          ["Phường B'lao", '24829'],
          ['Phường Lộc Phát', '24823'],
          ['Phường Lộc Sơn', '24829'],
          ['Phường Lộc Tiến', '24841'],
          ['Xã Đại Lào', '24841'],
          ['Xã Đạm Bri', '24820'],
          ['Xã Lộc Châu', '24841'],
          ['Xã Lộc Nga', '24829'],
          ['Xã Lộc Thanh', '24823']
        ]
      },
      {
        oldDistrict: 'Thành phố Đà Lạt',
        wards: [
          ['Phường 1', '24781'],
          ['Phường 2', '24781'],
          ['Phường 3', '24781'],
          ['Phường 4', '24781'],
          ['Phường 5', '24787'],
          ['Phường 6', '24787'],
          ['Phường 7', '24846'],
          ['Phường 8', '24778'],
          ['Phường 9', '24778'],
          ['Phường 10', '24781'],
          ['Phường 11', '24805'],
          ['Phường 12', '24778'],
          ['Xã Tà Nung', '24787'],
          ['Xã Trạm Hành', '24805'],
          ['Xã Xuân Thọ', '24805'],
          ['Xã Xuân Trường', '24805']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Long An',
    districts: [
      {
        oldDistrict: 'Huyện Bến Lức',
        wards: [
          ['Thị trấn Bến Lức', '27991'],
          ['Xã An Thạnh', '27991'],
          ['Xã Bình Đức', '28015'],
          ['Xã Long Hiệp', '28018'],
          ['Xã Lương Bình', '27994'],
          ['Xã Lương Hòa', '28003'],
          ['Xã Mỹ Yên', '28018'],
          ['Xã Nhựt Chánh', '28015'],
          ['Xã Phước Lợi', '28018'],
          ['Xã Tân Bửu', '28003'],
          ['Xã Thạnh Đức', '28015'],
          ['Xã Thạnh Hòa', '27994'],
          ['Xã Thạnh Lợi', '27994'],
          ['Xã Thanh Phú', '27991']
        ]
      },
      {
        oldDistrict: 'Huyện Cần Đước',
        wards: [
          ['Thị trấn Cần Đước', '28108'],
          ['Xã Long Cang', '28126'],
          ['Xã Long Định', '28126'],
          ['Xã Long Hòa', '28114'],
          ['Xã Long Hựu Đông', '28144'],
          ['Xã Long Hựu Tây', '28144'],
          ['Xã Long Khê', '28114'],
          ['Xã Long Sơn', '28132'],
          ['Xã Long Trạch', '28114'],
          ['Xã Mỹ Lệ', '28132'],
          ['Xã Phước Đông', '28138'],
          ['Xã Phước Tuy', '28108'],
          ['Xã Phước Vân', '28126'],
          ['Xã Tân Ân', '28108'],
          ['Xã Tân Chánh', '28108'],
          ['Xã Tân Lân', '28138'],
          ['Xã Tân Trạch', '28132']
        ]
      },
      {
        oldDistrict: 'Huyện Cần Giuộc',
        wards: [
          ['Thị trấn Cần Giuộc', '28159'],
          ['Xã Đông Thạnh', '28207'],
          ['Xã Long An', '28201'],
          ['Xã Long Hậu', '28159'],
          ['Xã Long Phụng', '28201'],
          ['Xã Long Thượng', '28165'],
          ['Xã Mỹ Lộc', '28177'],
          ['Xã Phước Hậu', '28165'],
          ['Xã Phước Lại', '28159'],
          ['Xã Phước Lâm', '28177'],
          ['Xã Phước Lý', '28165'],
          ['Xã Phước Vĩnh Đông', '28207'],
          ['Xã Phước Vĩnh Tây', '28201'],
          ['Xã Tân Tập', '28207'],
          ['Xã Thuận Thành', '28177']
        ]
      },
      {
        oldDistrict: 'Huyện Châu Thành',
        wards: [
          ['Thị trấn Tầm Vu', '28210'],
          ['Xã An Lục Long', '28243'],
          ['Xã Bình Quới', '28222'],
          ['Xã Dương Xuân Hội', '28243'],
          ['Xã Hiệp Thạnh', '28210'],
          ['Xã Hòa Phú', '28222'],
          ['Xã Long Trì', '28243'],
          ['Xã Phú Ngãi Trị', '28210'],
          ['Xã Phước Tân Hưng', '28210'],
          ['Xã Thanh Phú Long', '28225'],
          ['Xã Thanh Vĩnh Đông', '28225'],
          ['Xã Thuận Mỹ', '28225'],
          ['Xã Vĩnh Công', '28222']
        ]
      },
      {
        oldDistrict: 'Huyện Đức Hòa',
        wards: [
          ['Thị trấn Đức Hòa', '27937'],
          ['Thị trấn Hậu Nghĩa', '27931'],
          ['Thị trấn Hiệp Hòa', '27952'],
          ['Xã An Ninh Đông', '27943'],
          ['Xã An Ninh Tây', '27943'],
          ['Xã Đức Hòa Đông', '27976'],
          ['Xã Đức Hòa Hạ', '27937'],
          ['Xã Đức Hòa Thượng', '27976'],
          ['Xã Đức Lập Hạ', '27964'],
          ['Xã Đức Lập Thượng', '27931'],
          ['Xã Hiệp Hòa', '27952'],
          ['Xã Hòa Khánh Đông', '27979'],
          ['Xã Hòa Khánh Nam', '27979'],
          ['Xã Hòa Khánh Tây', '27979'],
          ['Xã Hựu Thạnh', '27937'],
          ['Xã Lộc Giang', '27943'],
          ['Xã Mỹ Hạnh Bắc', '27964'],
          ['Xã Mỹ Hạnh Nam', '27976'],
          ['Xã Tân Mỹ', '27931'],
          ['Xã Tân Phú', '27952']
        ]
      },
      {
        oldDistrict: 'Huyện Đức Huệ',
        wards: [
          ['Thị trấn Đông Thành', '27898'],
          ['Xã Bình Hòa Bắc', '27925'],
          ['Xã Bình Hòa Hưng', '27868'],
          ['Xã Bình Hòa Nam', '27925'],
          ['Xã Bình Thành', '27925'],
          ['Xã Mỹ Bình', '27898'],
          ['Xã Mỹ Quý Đông', '27907'],
          ['Xã Mỹ Quý Tây', '27907'],
          ['Xã Mỹ Thạnh Bắc', '27907'],
          ['Xã Mỹ Thạnh Đông', '27898'],
          ['Xã Mỹ Thạnh Tây', '27898']
        ]
      },
      {
        oldDistrict: 'Huyện Mộc Hóa',
        wards: [
          ['Thị trấn Bình Phong Thạnh', '27823'],
          ['Xã Bình Hòa Đông', '27811'],
          ['Xã Bình Hòa Tây', '27793'],
          ['Xã Bình Hòa Trung', '27811'],
          ['Xã Bình Thạnh', '27811'],
          ['Xã Tân Lập', '27823'],
          ['Xã Tân Thành', '27823']
        ]
      },
      {
        oldDistrict: 'Huyện Tân Hưng',
        wards: [
          ['Thị trấn Tân Hưng', '27721'],
          ['Xã Hưng Điền', '27727'],
          ['Xã Hưng Điền B', '27727'],
          ['Xã Hưng Hà', '27727'],
          ['Xã Hưng Thạnh', '27736'],
          ['Xã Thạnh Hưng', '27736'],
          ['Xã Vĩnh Bửu', '27748'],
          ['Xã Vĩnh Châu A', '27748'],
          ['Xã Vĩnh Châu B', '27736'],
          ['Xã Vĩnh Đại', '27748'],
          ['Xã Vĩnh Lợi', '27721'],
          ['Xã Vĩnh Thạnh', '27721']
        ]
      },
      {
        oldDistrict: 'Huyện Tân Thạnh',
        wards: [
          ['Thị trấn Tân Thạnh', '27826'],
          ['Xã Bắc Hòa', '27841'],
          ['Xã Hậu Thạnh Đông', '27841'],
          ['Xã Hậu Thạnh Tây', '27841'],
          ['Xã Kiến Bình', '27826'],
          ['Xã Nhơn Hoà', '27838'],
          ['Xã Nhơn Hòa Lập', '27838'],
          ['Xã Nhơn Ninh', '27856'],
          ['Xã Tân Bình', '27826'],
          ['Xã Tân Hòa', '27826'],
          ['Xã Tân Lập', '27838'],
          ['Xã Tân Ninh', '27856'],
          ['Xã Tân Thành', '27856']
        ]
      },
      {
        oldDistrict: 'Huyện Tân Trụ',
        wards: [
          ['Thị trấn Tân Trụ', '28075'],
          ['Xã Bình Lãng', '28075'],
          ['Xã Bình Tịnh', '28075'],
          ['Xã Bình Trinh Đông', '28075'],
          ['Xã Đức Tân', '28093'],
          ['Xã Lạc Tấn', '28087'],
          ['Xã Nhựt Ninh', '28093'],
          ['Xã Quê Mỹ Thạnh', '28087'],
          ['Xã Tân Bình', '28087'],
          ['Xã Tân Phước Tây', '28093']
        ]
      },
      {
        oldDistrict: 'Huyện Thạnh Hóa',
        wards: [
          ['Thị trấn Thạnh Hóa', '27865'],
          ['Xã Tân Đông', '27889'],
          ['Xã Tân Hiệp', '27868'],
          ['Xã Tân Tây', '27889'],
          ['Xã Thạnh An', '27865'],
          ['Xã Thạnh Phú', '27877'],
          ['Xã Thạnh Phước', '27877'],
          ['Xã Thuận Bình', '27868'],
          ['Xã Thuận Nghĩa Hòa', '27877'],
          ['Xã Thủy Đông', '27889'],
          ['Xã Thủy Tây', '27865']
        ]
      },
      {
        oldDistrict: 'Huyện Thủ Thừa',
        wards: [
          ['Thị trấn Thủ Thừa', '28036'],
          ['Xã Bình An', '28051'],
          ['Xã Bình Thạnh', '28036'],
          ['Xã Long Thạnh', '28072'],
          ['Xã Long Thuận', '28072'],
          ['Xã Mỹ An', '28066'],
          ['Xã Mỹ Lạc', '28051'],
          ['Xã Mỹ Phú', '28066'],
          ['Xã Mỹ Thạnh', '28051'],
          ['Xã Nhị Thành', '28036'],
          ['Xã Tân Long', '28072'],
          ['Xã Tân Thành', '28036']
        ]
      },
      {
        oldDistrict: 'Huyện Vĩnh Hưng',
        wards: [
          ['Thị trấn Vĩnh Hưng', '27757'],
          ['Xã Hưng Điền A', '27763'],
          ['Xã Khánh Hưng', '27763'],
          ['Xã Thái Bình Trung', '27775'],
          ['Xã Thái Trị', '27763'],
          ['Xã Tuyên Bình', '27775'],
          ['Xã Tuyên Bình Tây', '27775'],
          ['Xã Vĩnh Bình', '27775'],
          ['Xã Vĩnh Thuận', '27757'],
          ['Xã Vĩnh Trị', '27757']
        ]
      },
      {
        oldDistrict: 'Thành phố Tân An',
        wards: [
          ['Phường 1', '27694'],
          ['Phường 3', '27694'],
          ['Phường 4', '27694'],
          ['Phường 5', '27694'],
          ['Phường 6', '27694'],
          ['Phường 7', '27712'],
          ['Phường Khánh Hậu', '27715'],
          ['Phường Tân Khánh', '27715'],
          ['Xã An Vĩnh Ngãi', '27712'],
          ['Xã Bình Tâm', '27712'],
          ['Xã Hướng Thọ Phú', '27694'],
          ['Xã Lợi Bình Nhơn', '27715'],
          ['Xã Nhơn Thạnh Trung', '27712']
        ]
      },
      {
        oldDistrict: 'Thị xã Kiến Tường',
        wards: [
          ['Phường 1', '27787'],
          ['Phường 2', '27787'],
          ['Phường 3', '27787'],
          ['Xã Bình Hiệp', '27793'],
          ['Xã Bình Tân', '27793'],
          ['Xã Thạnh Hưng', '27817'],
          ['Xã Thạnh Trị', '27793'],
          ['Xã Tuyên Thạnh', '27817']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Nam Định',
    districts: [
      {
        oldDistrict: 'Huyện Giao Thủy',
        wards: [
          ['Thị trấn Giao Thủy', '14167'],
          ['Thị trấn Quất Lâm', '14212'],
          ['Xã Bạch Long', '14194'],
          ['Xã Bình Hòa', '14167'],
          ['Xã Giao An', '14182'],
          ['Xã Giao Châu', '14179'],
          ['Xã Giao Hà', '14203'],
          ['Xã Giao Hải', '14203'],
          ['Xã Giao Hương', '14161'],
          ['Xã Giao Lạc', '14182'],
          ['Xã Giao Long', '14179'],
          ['Xã Giao Nhân', '14179'],
          ['Xã Giao Phong', '14212'],
          ['Xã Giao Tân', '14194'],
          ['Xã Giao Thanh', '14161'],
          ['Xã Giao Thiện', '14161'],
          ['Xã Giao Thịnh', '14212'],
          ['Xã Giao Xuân', '14203'],
          ['Xã Giao Yến', '14194'],
          ['Xã Hồng Thuận', '14182']
        ]
      },
      {
        oldDistrict: 'Huyện Hải Hậu',
        wards: [
          ['Thị trấn Cồn', '14218'],
          ['Thị trấn Thịnh Long', '14221'],
          ['Thị trấn Yên Định', '14215'],
          ['Xã Hải An', '14281'],
          ['Xã Hải Anh', '14236'],
          ['Xã Hải Châu', '14221'],
          ['Xã Hải Đông', '14287'],
          ['Xã Hải Đường', '14236'],
          ['Xã Hải Giang', '14281'],
          ['Xã Hải Hòa', '14308'],
          ['Xã Hải Hưng', '14248'],
          ['Xã Hải Long', '14215'],
          ['Xã Hải Lộc', '14248'],
          ['Xã Hải Minh', '14236'],
          ['Xã Hải Nam', '14248'],
          ['Xã Hải Ninh', '14221'],
          ['Xã Hải Phong', '14281'],
          ['Xã Hải Phú', '14308'],
          ['Xã Hải Quang', '14287'],
          ['Xã Hải Sơn', '14218'],
          ['Xã Hải Tân', '14218'],
          ['Xã Hải Tây', '14287'],
          ['Xã Hải Trung', '14215'],
          ['Xã Hải Xuân', '14308']
        ]
      },
      {
        oldDistrict: 'Huyện Nam Trực',
        wards: [
          ['Thị trấn Nam Giang', '13966'],
          ['Xã Bình Minh', '14011'],
          ['Xã Đồng Sơn', '14014'],
          ['Xã Hồng Quang', '13984'],
          ['Xã Nam Cường', '13966'],
          ['Xã Nam Dương', '14011'],
          ['Xã Nam Điền', '13972'],
          ['Xã Nam Hải', '14005'],
          ['Xã Nam Hoa', '14005'],
          ['Xã Nam Hồng', '13987'],
          ['Xã Nam Hùng', '13966'],
          ['Xã Nam Lợi', '14005'],
          ['Xã Nam Thái', '14014'],
          ['Xã Nam Thanh', '14005'],
          ['Xã Nam Thắng', '13987'],
          ['Xã Nam Tiến', '14011'],
          ['Xã Nghĩa An', '13984'],
          ['Xã Tân Thịnh', '13987']
        ]
      },
      {
        oldDistrict: 'Huyện Nghĩa Hưng',
        wards: [
          ['Thị trấn Liễu Đề', '13891'],
          ['Thị trấn Quỹ Nhất', '13939'],
          ['Thị trấn Rạng Đông', '13894'],
          ['Xã Đồng Thịnh', '13900'],
          ['Xã Hoàng Nam', '13900'],
          ['Xã Nam Điền', '13894'],
          ['Xã Nghĩa Châu', '13891'],
          ['Xã Nghĩa Hải', '13957'],
          ['Xã Nghĩa Hồng', '13927'],
          ['Xã Nghĩa Hùng', '13957'],
          ['Xã Nghĩa Lạc', '13918'],
          ['Xã Nghĩa Lâm', '13957'],
          ['Xã Nghĩa Lợi', '13939'],
          ['Xã Nghĩa Phong', '13927'],
          ['Xã Nghĩa Phú', '13927'],
          ['Xã Nghĩa Sơn', '13918'],
          ['Xã Nghĩa Thái', '13891'],
          ['Xã Nghĩa Thành', '13939'],
          ['Xã Nghĩa Trung', '13891'],
          ['Xã Phúc Thắng', '13894']
        ]
      },
      {
        oldDistrict: 'Huyện Trực Ninh',
        wards: [
          ['Thị trấn Cát Thành', '14056'],
          ['Thị trấn Cổ Lễ', '14026'],
          ['Thị trấn Ninh Cường', '14077'],
          ['Xã Liêm Hải', '14038'],
          ['Xã Phương Định', '14038'],
          ['Xã Trung Đông', '14026'],
          ['Xã Trực Chính', '14038'],
          ['Xã Trực Cường', '14077'],
          ['Xã Trực Đại', '14071'],
          ['Xã Trực Đạo', '14056'],
          ['Xã Trực Hùng', '14077'],
          ['Xã Trực Hưng', '14053'],
          ['Xã Trực Khang', '14062'],
          ['Xã Trực Mỹ', '14062'],
          ['Xã Trực Nội', '14053'],
          ['Xã Trực Thái', '14071'],
          ['Xã Trực Thanh', '14053'],
          ['Xã Trực Thắng', '14071'],
          ['Xã Trực Thuận', '14062'],
          ['Xã Trực Tuấn', '14026'],
          ['Xã Việt Hùng', '14056']
        ]
      },
      {
        oldDistrict: 'Huyện Vụ Bản',
        wards: [
          ['Thị trấn Gôi', '13741'],
          ['Xã Cộng Hòa', '13750'],
          ['Xã Đại An', '13699'],
          ['Xã Đại Thắng', '13786'],
          ['Xã Hiển Khánh', '13753'],
          ['Xã Hợp Hưng', '13753'],
          ['Xã Kim Thái', '13741'],
          ['Xã Liên Minh', '13786'],
          ['Xã Minh Tân', '13750'],
          ['Xã Quang Trung', '13753'],
          ['Xã Tam Thanh', '13741'],
          ['Xã Thành Lợi', '13777'],
          ['Xã Trung Thành', '13753'],
          ['Xã Vĩnh Hào', '13786']
        ]
      },
      {
        oldDistrict: 'Huyện Xuân Trường',
        wards: [
          ['Thị trấn Xuân Trường', '14089'],
          ['Xã Thọ Nghiệp', '14122'],
          ['Xã Trà Lũ', '14122'],
          ['Xã Xuân Châu', '14095'],
          ['Xã Xuân Giang', '14104'],
          ['Xã Xuân Hồng', '14095'],
          ['Xã Xuân Ngọc', '14089'],
          ['Xã Xuân Ninh', '14089'],
          ['Xã Xuân Phú', '14104'],
          ['Xã Xuân Phúc', '14089'],
          ['Xã Xuân Tân', '14104'],
          ['Xã Xuân Thành', '14095'],
          ['Xã Xuân Thượng', '14095'],
          ['Xã Xuân Vinh', '14122']
        ]
      },
      {
        oldDistrict: 'Huyện Ý Yên',
        wards: [
          ['Thị trấn Lâm', '13795'],
          ['Xã Hồng Quang', '13795'],
          ['Xã Phú Hưng', '13822'],
          ['Xã Tân Minh', '13807'],
          ['Xã Trung Nghĩa', '13807'],
          ['Xã Yên Bình', '13834'],
          ['Xã Yên Chính', '13822'],
          ['Xã Yên Cường', '13870'],
          ['Xã Yên Dương', '13834'],
          ['Xã Yên Đồng', '13879'],
          ['Xã Yên Khang', '13879'],
          ['Xã Yên Khánh', '13795'],
          ['Xã Yên Lộc', '13870'],
          ['Xã Yên Lương', '13864'],
          ['Xã Yên Mỹ', '13834'],
          ['Xã Yên Nhân', '13870'],
          ['Xã Yên Ninh', '13834'],
          ['Xã Yên Phong', '13795'],
          ['Xã Yên Phúc', '13870'],
          ['Xã Yên Thắng', '13864'],
          ['Xã Yên Thọ', '13822'],
          ['Xã Yên Tiến', '13864'],
          ['Xã Yên Trị', '13879']
        ]
      },
      {
        oldDistrict: 'Thành phố Nam Định',
        wards: [
          ['Phường Cửa Bắc', '13669'],
          ['Phường Cửa Nam', '13669'],
          ['Phường Hưng Lộc', '13708'],
          ['Phường Lộc Hạ', '13684'],
          ['Phường Lộc Hòa', '13693'],
          ['Phường Lộc Vượng', '13669'],
          ['Phường Mỹ Xá', '13699'],
          ['Phường Nam Phong', '13972'],
          ['Phường Nam Vân', '13984'],
          ['Phường Năng Tĩnh', '13669'],
          ['Phường Quang Trung', '13669'],
          ['Phường Trần Hưng Đạo', '13669'],
          ['Phường Trường Thi', '13777'],
          ['Phường Vị Xuyên', '13669'],
          ['Xã Mỹ Hà', '13693'],
          ['Xã Mỹ Lộc', '13708'],
          ['Xã Mỹ Phúc', '13669'],
          ['Xã Mỹ Tân', '13684'],
          ['Xã Mỹ Thắng', '13693'],
          ['Xã Mỹ Thuận', '13708'],
          ['Xã Mỹ Trung', '13684']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Nghệ An',
    districts: [
      {
        oldDistrict: 'Huyện Anh Sơn',
        wards: [
          ['Thị trấn Kim Nhan', '17329'],
          ['Xã Bình Sơn', '17335'],
          ['Xã Cao Sơn', '17380'],
          ['Xã Cẩm Sơn', '17344'],
          ['Xã Đức Sơn', '17329'],
          ['Xã Hoa Sơn', '17357'],
          ['Xã Hội Sơn', '17357'],
          ['Xã Hùng Sơn', '17344'],
          ['Xã Khai Sơn', '17380'],
          ['Xã Lạng Sơn', '17365'],
          ['Xã Lĩnh Sơn', '17380'],
          ['Xã Long Sơn', '17380'],
          ['Xã Phúc Sơn', '17329'],
          ['Xã Tam Đỉnh', '17344'],
          ['Xã Tào Sơn', '17365'],
          ['Xã Thành Sơn', '17335'],
          ['Xã Thọ Sơn', '17335'],
          ['Xã Tường Sơn', '17357'],
          ['Xã Vĩnh Sơn', '17365']
        ]
      },
      {
        oldDistrict: 'Huyện Con Cuông',
        wards: [
          ['Thị trấn Trà Lân', '17254'],
          ['Xã Bình Chuẩn', '17230'],
          ['Xã Cam Lâm', '17242'],
          ['Xã Châu Khê', '17248'],
          ['Xã Chi Khê', '17254'],
          ['Xã Đôn Phục', '17242'],
          ['Xã Lạng Khê', '17248'],
          ['Xã Lục Dạ', '17263'],
          ['Xã Mậu Đức', '17239'],
          ['Xã Môn Sơn', '17263'],
          ['Xã Thạch Ngàn', '17239'],
          ['Xã Yên Khê', '17254']
        ]
      },
      {
        oldDistrict: 'Huyện Diễn Châu',
        wards: [
          ['Thị trấn Diễn Thành', '17464'],
          ['Xã Diễn An', '17479'],
          ['Xã Diễn Cát', '17476'],
          ['Xã Diễn Đoài', '17395'],
          ['Xã Diễn Đồng', '17443'],
          ['Xã Diễn Hoa', '17464'],
          ['Xã Diễn Hoàng', '17419'],
          ['Xã Diễn Hồng', '17416'],
          ['Xã Diễn Kim', '17419'],
          ['Xã Diễn Kỷ', '17416'],
          ['Xã Diễn Lâm', '17395'],
          ['Xã Diễn Liên', '17443'],
          ['Xã Diễn Lộc', '17488'],
          ['Xã Diễn Lợi', '17488'],
          ['Xã Diễn Mỹ', '17419'],
          ['Xã Diễn Nguyên', '17476'],
          ['Xã Diễn Phong', '17416'],
          ['Xã Diễn Phú', '17488'],
          ['Xã Diễn Phúc', '17464'],
          ['Xã Diễn Tân', '17479'],
          ['Xã Diễn Thái', '17443'],
          ['Xã Diễn Thịnh', '17479'],
          ['Xã Diễn Thọ', '17488'],
          ['Xã Diễn Trung', '17479'],
          ['Xã Diễn Trường', '17395'],
          ['Xã Diễn Vạn', '17416'],
          ['Xã Diễn Yên', '17395'],
          ['Xã Hạnh Quảng', '17476'],
          ['Xã Hùng Hải', '17419'],
          ['Xã Minh Châu', '17476'],
          ['Xã Ngọc Bích', '17464'],
          ['Xã Xuân Tháp', '17443']
        ]
      },
      {
        oldDistrict: 'Huyện Đô Lương',
        wards: [
          ['Thị trấn Đô Lương', '17662'],
          ['Xã Bạch Ngọc', '17623'],
          ['Xã Bài Sơn', '17641'],
          ['Xã Bắc Sơn', '17662'],
          ['Xã Bồi Sơn', '17623'],
          ['Xã Đà Sơn', '17662'],
          ['Xã Đại Sơn', '17707'],
          ['Xã Đặng Sơn', '17662'],
          ['Xã Đông Sơn', '17641'],
          ['Xã Giang Sơn Đông', '17623'],
          ['Xã Giang Sơn Tây', '17623'],
          ['Xã Hiến Sơn', '17707'],
          ['Xã Hòa Sơn', '17677'],
          ['Xã Hồng Sơn', '17641'],
          ['Xã Lạc Sơn', '17689'],
          ['Xã Lưu Sơn', '17662'],
          ['Xã Minh Sơn', '17689'],
          ['Xã Mỹ Sơn', '17707'],
          ['Xã Nam Sơn', '17662'],
          ['Xã Nhân Sơn', '17689'],
          ['Xã Quang Sơn', '17677'],
          ['Xã Tân Sơn', '17677'],
          ['Xã Thái Sơn', '17677'],
          ['Xã Thịnh Sơn', '17662'],
          ['Xã Thuận Sơn', '17689'],
          ['Xã Thượng Sơn', '17677'],
          ['Xã Tràng Sơn', '17641'],
          ['Xã Trù Sơn', '17707'],
          ['Xã Trung Sơn', '17689'],
          ['Xã Văn Sơn', '17662'],
          ['Xã Xuân Sơn', '17689'],
          ['Xã Yên Sơn', '17662']
        ]
      },
      {
        oldDistrict: 'Huyện Hưng Nguyên',
        wards: [
          ['Thị trấn Hưng Nguyên', '18001'],
          ['Xã Châu Nhân', '18040'],
          ['Xã Hưng Đạo', '18001'],
          ['Xã Hưng Lĩnh', '18028'],
          ['Xã Hưng Nghĩa', '18040'],
          ['Xã Hưng Tây', '18001'],
          ['Xã Hưng Thành', '18040'],
          ['Xã Hưng Trung', '18007'],
          ['Xã Hưng Yên', '18007'],
          ['Xã Hưng Yên Bắc', '18007'],
          ['Xã Long Xá', '18028'],
          ['Xã Phúc Lợi', '18040'],
          ['Xã Thịnh Mỹ', '18001'],
          ['Xã Thông Tân', '18028'],
          ['Xã Xuân Lam', '18028']
        ]
      },
      {
        oldDistrict: 'Huyện Kỳ Sơn',
        wards: [
          ['Thị trấn Mường Xén', '16813'],
          ['Xã Bảo Nam', '16849'],
          ['Xã Bảo Thắng', '16855'],
          ['Xã Bắc Lý', '16819'],
          ['Xã Chiêu Lưu', '16855'],
          ['Xã Đoọc Mạy', '16834'],
          ['Xã Huồi Tụ', '16828'],
          ['Xã Hữu Kiệm', '16849'],
          ['Xã Hữu Lập', '16849'],
          ['Xã Keng Đu', '16822'],
          ['Xã Mường Ải', '16858'],
          ['Xã Mường Lống', '16831'],
          ['Xã Mường Típ', '16858'],
          ['Xã Mỹ Lý', '16816'],
          ['Xã Na Loi', '16834'],
          ['Xã Na Ngoi', '16870'],
          ['Xã Nậm Càn', '16870'],
          ['Xã Nậm Cắn', '16837'],
          ['Xã Phà Đánh', '16837'],
          ['Xã Tà Cạ', '16813'],
          ['Xã Tây Sơn', '16813']
        ]
      },
      {
        oldDistrict: 'Huyện Nam Đàn',
        wards: [
          ['Thị trấn Nam Đàn', '17950'],
          ['Xã Hùng Tiến', '17971'],
          ['Xã Khánh Sơn', '17989'],
          ['Xã Kim Liên', '17971'],
          ['Xã Nam Anh', '17944'],
          ['Xã Nam Cát', '17971'],
          ['Xã Nam Giang', '17971'],
          ['Xã Nam Hưng', '17935'],
          ['Xã Nam Kim', '17989'],
          ['Xã Nam Lĩnh', '17944'],
          ['Xã Nam Thanh', '17935'],
          ['Xã Nam Xuân', '17944'],
          ['Xã Nghĩa Thái', '17935'],
          ['Xã Thượng Tân Lộc', '17950'],
          ['Xã Trung Phúc Cường', '17989'],
          ['Xã Xuân Hòa', '17950'],
          ['Xã Xuân Hồng', '17971']
        ]
      },
      {
        oldDistrict: 'Huyện Nghi Lộc',
        wards: [
          ['Thị trấn Quán Hành', '17827'],
          ['Xã Diên Hoa', '17827'],
          ['Xã Khánh Hợp', '17878'],
          ['Xã Nghi Công Bắc', '17857'],
          ['Xã Nghi Công Nam', '17857'],
          ['Xã Nghi Đồng', '17842'],
          ['Xã Nghi Hưng', '17842'],
          ['Xã Nghi Kiều', '17854'],
          ['Xã Nghi Lâm', '17857'],
          ['Xã Nghi Long', '17866'],
          ['Xã Nghi Mỹ', '17857'],
          ['Xã Nghi Phương', '17842'],
          ['Xã Nghi Quang', '17866'],
          ['Xã Nghi Thạch', '17878'],
          ['Xã Nghi Thiết', '17833'],
          ['Xã Nghi Thuận', '17866'],
          ['Xã Nghi Tiến', '17833'],
          ['Xã Nghi Trung', '17827'],
          ['Xã Nghi Vạn', '17827'],
          ['Xã Nghi Văn', '17854'],
          ['Xã Nghi Xá', '17866'],
          ['Xã Nghi Yên', '17833'],
          ['Xã Thịnh Trường', '17878']
        ]
      },
      {
        oldDistrict: 'Huyện Nghĩa Đàn',
        wards: [
          ['Thị trấn Nghĩa Đàn', '16941'],
          ['Xã Nghĩa An', '17032'],
          ['Xã Nghĩa Bình', '16941'],
          ['Xã Nghĩa Đức', '17032'],
          ['Xã Nghĩa Hội', '16969'],
          ['Xã Nghĩa Hồng', '16975'],
          ['Xã Nghĩa Hưng', '16972'],
          ['Xã Nghĩa Khánh', '17032'],
          ['Xã Nghĩa Lạc', '16951'],
          ['Xã Nghĩa Lâm', '16951'],
          ['Xã Nghĩa Long', '17029'],
          ['Xã Nghĩa Lộc', '17029'],
          ['Xã Nghĩa Lợi', '16969'],
          ['Xã Nghĩa Mai', '16975'],
          ['Xã Nghĩa Minh', '16975'],
          ['Xã Nghĩa Sơn', '16951'],
          ['Xã Nghĩa Thành', '16972'],
          ['Xã Nghĩa Thọ', '16969'],
          ['Xã Nghĩa Trung', '16941'],
          ['Xã Nghĩa Yên', '16951']
        ]
      },
      {
        oldDistrict: 'Huyện Quế Phong',
        wards: [
          ['Thị trấn Kim Sơn', '16738'],
          ['Xã Căm Muộn', '16774'],
          ['Xã Châu Kim', '16738'],
          ['Xã Châu Thôn', '16774'],
          ['Xã Đồng Văn', '16744'],
          ['Xã Hạnh Dịch', '16750'],
          ['Xã Mường Nọc', '16738'],
          ['Xã Nậm Giải', '16738'],
          ['Xã Nậm Nhoóng', '16756'],
          ['Xã Quang Phong', '16774'],
          ['Xã Thông Thụ', '16744'],
          ['Xã Tiền Phong', '16750'],
          ['Xã Tri Lễ', '16756']
        ]
      },
      {
        oldDistrict: 'Huyện Quỳ Châu',
        wards: [
          ['Thị trấn Tân Lạc', '16777'],
          ['Xã Châu Bình', '16804'],
          ['Xã Châu Bính', '16792'],
          ['Xã Châu Hạnh', '16777'],
          ['Xã Châu Hoàn', '16801'],
          ['Xã Châu Hội', '16777'],
          ['Xã Châu Nga', '16777'],
          ['Xã Châu Phong', '16801'],
          ['Xã Châu Thắng', '16792'],
          ['Xã Châu Thuận', '16792'],
          ['Xã Châu Tiến', '16792'],
          ['Xã Diên Lãm', '16801']
        ]
      },
      {
        oldDistrict: 'Huyện Quỳ Hợp',
        wards: [
          ['Thị trấn Quỳ Hợp', '17035'],
          ['Xã Bắc Sơn', '17089'],
          ['Xã Châu Cường', '17077'],
          ['Xã Châu Đình', '17035'],
          ['Xã Châu Hồng', '17044'],
          ['Xã Châu Lộc', '17056'],
          ['Xã Châu Lý', '17089'],
          ['Xã Châu Quang', '17035'],
          ['Xã Châu Thái', '17077'],
          ['Xã Châu Thành', '17044'],
          ['Xã Châu Tiến', '17044'],
          ['Xã Đồng Hợp', '17059'],
          ['Xã Hạ Sơn', '17071'],
          ['Xã Liên Hợp', '17056'],
          ['Xã Minh Hợp', '17071'],
          ['Xã Nam Sơn', '17089'],
          ['Xã Nghĩa Xuân', '17059'],
          ['Xã Tam Hợp', '17059'],
          ['Xã Thọ Hợp', '17035'],
          ['Xã Văn Lợi', '17071'],
          ['Xã Yên Hợp', '17059']
        ]
      },
      {
        oldDistrict: 'Huyện Quỳnh Lưu',
        wards: [
          ['Thị trấn Cầu Giát', '17179'],
          ['Xã An Hòa', '17212'],
          ['Xã Bình Sơn', '17179'],
          ['Xã Minh Lương', '17176'],
          ['Xã Ngọc Sơn', '17170'],
          ['Xã Phú Nghĩa', '17212'],
          ['Xã Quỳnh Bảng', '17176'],
          ['Xã Quỳnh Châu', '17149'],
          ['Xã Quỳnh Diễn', '17179'],
          ['Xã Quỳnh Đôi', '17176'],
          ['Xã Quỳnh Giang', '17179'],
          ['Xã Quỳnh Hậu', '17179'],
          ['Xã Quỳnh Lâm', '17170'],
          ['Xã Quỳnh Sơn', '17170'],
          ['Xã Quỳnh Tam', '17149'],
          ['Xã Quỳnh Tân', '17143'],
          ['Xã Quỳnh Thạch', '17143'],
          ['Xã Quỳnh Thanh', '17176'],
          ['Xã Quỳnh Thắng', '17224'],
          ['Xã Quỳnh Văn', '17143'],
          ['Xã Quỳnh Yên', '17176'],
          ['Xã Tân Sơn', '17149'],
          ['Xã Tân Thắng', '17224'],
          ['Xã Thuận Long', '17212'],
          ['Xã Văn Hải', '17212']
        ]
      },
      {
        oldDistrict: 'Huyện Tân Kỳ',
        wards: [
          ['Thị trấn Tân Kỳ', '17266'],
          ['Xã Bình Hợp', '17284'],
          ['Xã Đồng Văn', '17287'],
          ['Xã Giai Xuân', '17278'],
          ['Xã Hoàn Long', '17272'],
          ['Xã Hương Sơn', '17305'],
          ['Xã Kỳ Sơn', '17266'],
          ['Xã Kỳ Tân', '17266'],
          ['Xã Nghĩa Dũng', '17266'],
          ['Xã Nghĩa Đồng', '17284'],
          ['Xã Nghĩa Hành', '17326'],
          ['Xã Nghĩa Phúc', '17305'],
          ['Xã Nghĩa Thái', '17272'],
          ['Xã Phú Sơn', '17326'],
          ['Xã Tân An', '17305'],
          ['Xã Tân Hợp', '17278'],
          ['Xã Tân Hương', '17326'],
          ['Xã Tân Phú', '17272'],
          ['Xã Tân Xuân', '17272'],
          ['Xã Tiên Kỳ', '17287']
        ]
      },
      {
        oldDistrict: 'Huyện Thanh Chương',
        wards: [
          ['Thị trấn Dùng', '17713'],
          ['Xã Cát Văn', '17728'],
          ['Xã Đại Đồng', '17713'],
          ['Xã Đồng Văn', '17713'],
          ['Xã Hạnh Lâm', '17722'],
          ['Xã Kim Bảng', '17791'],
          ['Xã Mai Giang', '17818'],
          ['Xã Minh Sơn', '17728'],
          ['Xã Minh Tiến', '17779'],
          ['Xã Ngọc Lâm', '17759'],
          ['Xã Ngọc Sơn', '17779'],
          ['Xã Phong Thịnh', '17728'],
          ['Xã Thanh An', '17770'],
          ['Xã Thanh Đức', '17722'],
          ['Xã Thanh Hà', '17791'],
          ['Xã Thanh Hương', '17770'],
          ['Xã Thanh Lâm', '17818'],
          ['Xã Thanh Liên', '17743'],
          ['Xã Thanh Mỹ', '17743'],
          ['Xã Thanh Ngọc', '17713'],
          ['Xã Thanh Phong', '17713'],
          ['Xã Thanh Quả', '17770'],
          ['Xã Thanh Sơn', '17759'],
          ['Xã Thanh Thịnh', '17770'],
          ['Xã Thanh Thủy', '17791'],
          ['Xã Thanh Tiên', '17743'],
          ['Xã Thanh Tùng', '17818'],
          ['Xã Thanh Xuân', '17818'],
          ['Xã Xuân Dương', '17779']
        ]
      },
      {
        oldDistrict: 'Huyện Tương Dương',
        wards: [
          ['Thị trấn Thạch Giám', '16876'],
          ['Xã Hữu Khuông', '16885'],
          ['Xã Lưỡng Minh', '16906'],
          ['Xã Lưu Kiền', '16876'],
          ['Xã Mai Sơn', '16882'],
          ['Xã Nga My', '16903'],
          ['Xã Nhôn Mai', '16882'],
          ['Xã Tam Đình', '16933'],
          ['Xã Tam Hợp', '16936'],
          ['Xã Tam Quang', '16933'],
          ['Xã Tam Thái', '16936'],
          ['Xã Xá Lượng', '16876'],
          ['Xã Xiêng My', '16903'],
          ['Xã Yên Hòa', '16909'],
          ['Xã Yên Na', '16912'],
          ['Xã Yên Thắng', '16909'],
          ['Xã Yên Tĩnh', '16912']
        ]
      },
      {
        oldDistrict: 'Huyện Yên Thành',
        wards: [
          ['Thị trấn Hoa Thành', '17506'],
          ['Xã Bảo Thành', '17605'],
          ['Xã Bắc Thành', '17569'],
          ['Xã Đô Thành', '17530'],
          ['Xã Đồng Thành', '17521'],
          ['Xã Đông Thành', '17506'],
          ['Xã Đức Thành', '17515'],
          ['Xã Hậu Thành', '17524'],
          ['Xã Kim Thành', '17521'],
          ['Xã Lăng Thành', '17524'],
          ['Xã Liên Thành', '17611'],
          ['Xã Long Thành', '17605'],
          ['Xã Mã Thành', '17515'],
          ['Xã Minh Thành', '17560'],
          ['Xã Mỹ Thành', '17611'],
          ['Xã Nam Thành', '17569'],
          ['Xã Phú Thành', '17530'],
          ['Xã Phúc Thành', '17524'],
          ['Xã Quang Thành', '17521'],
          ['Xã Sơn Thành', '17605'],
          ['Xã Tăng Thành', '17506'],
          ['Xã Tân Thành', '17515'],
          ['Xã Tây Thành', '17560'],
          ['Xã Thịnh Thành', '17560'],
          ['Xã Thọ Thành', '17530'],
          ['Xã Tiến Thành', '17515'],
          ['Xã Trung Thành', '17569'],
          ['Xã Văn Thành', '17506'],
          ['Xã Vân Tụ', '17611'],
          ['Xã Viên Thành', '17605'],
          ['Xã Vĩnh Thành', '17605'],
          ['Xã Xuân Thành', '17569']
        ]
      },
      {
        oldDistrict: 'Thành phố Vinh',
        wards: [
          ['Phường Bến Thủy', '16690'],
          ['Phường Cửa Nam', '16681'],
          ['Phường Đông Vĩnh', '16681'],
          ['Phường Hà Huy Tập', '16702'],
          ['Phường Hưng Bình', '16681'],
          ['Phường Hưng Dũng', '16690'],
          ['Phường Hưng Đông', '17920'],
          ['Phường Hưng Lộc', '16708'],
          ['Phường Hưng Phúc', '16690'],
          ['Phường Lê Lợi', '16681'],
          ['Phường Nghi Đức', '16702'],
          ['Phường Nghi Hải', '16732'],
          ['Phường Nghi Hòa', '16732'],
          ['Phường Nghi Hương', '16732'],
          ['Phường Nghi Phú', '16702'],
          ['Phường Nghi Tân', '16732'],
          ['Phường Nghi Thu', '16732'],
          ['Phường Nghi Thuỷ', '16732'],
          ['Phường Quán Bàu', '17920'],
          ['Phường Quang Trung', '16681'],
          ['Phường Thu Thuỷ', '16732'],
          ['Phường Trung Đô', '16690'],
          ['Phường Trường Thi', '16690'],
          ['Phường Vinh Tân', '16690'],
          ['Xã Hưng Chính', '16681'],
          ['Xã Hưng Hòa', '16690'],
          ['Xã Nghi Ân', '16702'],
          ['Xã Nghi Kim', '17920'],
          ['Xã Nghi Liên', '17920'],
          ['Xã Nghi Phong', '16708'],
          ['Xã Nghi Thái', '16708'],
          ['Xã Nghi Xuân', '16708'],
          ['Xã Phúc Thọ', '16708']
        ]
      },
      {
        oldDistrict: 'Thị xã Hoàng Mai',
        wards: [
          ['Phường Mai Hùng', '17125'],
          ['Phường Quỳnh Dị', '17128'],
          ['Phường Quỳnh Phương', '17125'],
          ['Phường Quỳnh Thiện', '17110'],
          ['Phường Quỳnh Xuân', '17125'],
          ['Xã Quỳnh Lập', '17128'],
          ['Xã Quỳnh Liên', '17125'],
          ['Xã Quỳnh Lộc', '17128'],
          ['Xã Quỳnh Trang', '17110'],
          ['Xã Quỳnh Vinh', '17110']
        ]
      },
      {
        oldDistrict: 'Thị xã Thái Hoà',
        wards: [
          ['Phường Hoà Hiếu', '16939'],
          ['Phường Long Sơn', '16939'],
          ['Phường Quang Phong', '16939'],
          ['Phường Quang Tiến', '17011'],
          ['Xã Đông Hiếu', '17017'],
          ['Xã Nghĩa Mỹ', '17017'],
          ['Xã Nghĩa Thuận', '17017'],
          ['Xã Nghĩa Tiến', '17011'],
          ['Xã Tây Hiếu', '17011']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Ninh Bình',
    districts: [
      {
        oldDistrict: 'Huyện Gia Viễn',
        wards: [
          ['Thị trấn Thịnh Vượng', '14464'],
          ['Xã Gia Hòa', '14464'],
          ['Xã Gia Hưng', '14482'],
          ['Xã Gia Lạc', '14524'],
          ['Xã Gia Lập', '14488'],
          ['Xã Gia Minh', '14524'],
          ['Xã Gia Phong', '14524'],
          ['Xã Gia Phú', '14482'],
          ['Xã Gia Phương', '14500'],
          ['Xã Gia Sinh', '14533'],
          ['Xã Gia Tân', '14488'],
          ['Xã Gia Thanh', '14494'],
          ['Xã Gia Trấn', '14494'],
          ['Xã Gia Trung', '14500'],
          ['Xã Gia Vân', '14488'],
          ['Xã Gia Xuân', '14494'],
          ['Xã Liên Sơn', '14482'],
          ['Xã Tiến Thắng', '14500']
        ]
      },
      {
        oldDistrict: 'Huyện Kim Sơn',
        wards: [
          ['Thị trấn Bình Minh', '14623'],
          ['Thị trấn Phát Diệm', '14620'],
          ['Xã Ân Hòa', '14638'],
          ['Xã Chất Bình', '14653'],
          ['Xã Cồn Thoi', '14623'],
          ['Xã Định Hóa', '14677'],
          ['Xã Đồng Hướng', '14647'],
          ['Xã Hồi Ninh', '14653'],
          ['Xã Hùng Tiến', '14638'],
          ['Xã Kim Chính', '14620'],
          ['Xã Kim Định', '14638'],
          ['Xã Kim Đông', '14698'],
          ['Xã Kim Mỹ', '14623'],
          ['Xã Kim Tân', '14677'],
          ['Xã Kim Trung', '14698'],
          ['Xã Lai Thành', '14674'],
          ['Xã Như Hòa', '14647'],
          ['Xã Quang Thiện', '14647'],
          ['Xã Tân Thành', '14674'],
          ['Xã Thượng Kiệm', '14620'],
          ['Xã Văn Hải', '14677'],
          ['Xã Xuân Chính', '14653'],
          ['Xã Yên Lộc', '14674']
        ]
      },
      {
        oldDistrict: 'Huyện Nho Quan',
        wards: [
          ['Thị trấn Nho Quan', '14428'],
          ['Xã Cúc Phương', '14404'],
          ['Xã Đồng Phong', '14428'],
          ['Xã Đức Long', '14401'],
          ['Xã Gia Lâm', '14389'],
          ['Xã Gia Sơn', '14389'],
          ['Xã Gia Thủy', '14401'],
          ['Xã Gia Tường', '14401'],
          ['Xã Kỳ Phú', '14458'],
          ['Xã Lạc Vân', '14407'],
          ['Xã Phú Long', '14458'],
          ['Xã Phú Lộc', '14452'],
          ['Xã Phú Sơn', '14407'],
          ['Xã Phúc Sơn', '14533'],
          ['Xã Quảng Lạc', '14371'],
          ['Xã Quỳnh Lưu', '14452'],
          ['Xã Thạch Bình', '14407'],
          ['Xã Thanh Sơn', '14434'],
          ['Xã Thượng Hòa', '14434'],
          ['Xã Văn Phú', '14434'],
          ['Xã Văn Phương', '14404'],
          ['Xã Xích Thổ', '14389'],
          ['Xã Yên Quang', '14428']
        ]
      },
      {
        oldDistrict: 'Huyện Yên Khánh',
        wards: [
          ['Thị trấn Yên Ninh', '14560'],
          ['Xã Khánh An', '14566'],
          ['Xã Khánh Công', '14608'],
          ['Xã Khánh Cư', '14560'],
          ['Xã Khánh Cường', '14563'],
          ['Xã Khánh Hải', '14560'],
          ['Xã Khánh Hòa', '14566'],
          ['Xã Khánh Hội', '14614'],
          ['Xã Khánh Hồng', '14611'],
          ['Xã Khánh Lợi', '14563'],
          ['Xã Khánh Mậu', '14614'],
          ['Xã Khánh Nhạc', '14611'],
          ['Xã Khánh Phú', '14566'],
          ['Xã Khánh Thành', '14608'],
          ['Xã Khánh Thiện', '14563'],
          ['Xã Khánh Thủy', '14614'],
          ['Xã Khánh Trung', '14608'],
          ['Xã Khánh Vân', '14560']
        ]
      },
      {
        oldDistrict: 'Huyện Yên Mô',
        wards: [
          ['Thị trấn Yên Thịnh', '14701'],
          ['Xã Khánh Dương', '14701'],
          ['Xã Khánh Thượng', '14725'],
          ['Xã Yên Đồng', '14746'],
          ['Xã Yên Hòa', '14701'],
          ['Xã Yên Lâm', '14743'],
          ['Xã Yên Mạc', '14743'],
          ['Xã Yên Mỹ', '14743'],
          ['Xã Yên Nhân', '14728'],
          ['Xã Yên Phong', '14728'],
          ['Xã Yên Thái', '14746'],
          ['Xã Yên Thành', '14746'],
          ['Xã Yên Thắng', '14725'],
          ['Xã Yên Từ', '14728']
        ]
      },
      {
        oldDistrict: 'Thành phố Hoa Lư',
        wards: [
          ['Phường Bích Đào', '14329'],
          ['Phường Đông Thành', '14329'],
          ['Phường Nam Bình', '14329'],
          ['Phường Nam Thành', '14329'],
          ['Phường Ninh Giang', '14533'],
          ['Phường Ninh Khánh', '14329'],
          ['Phường Ninh Mỹ', '14329'],
          ['Phường Ninh Phong', '14359'],
          ['Phường Ninh Phúc', '14566'],
          ['Phường Ninh Sơn', '14359'],
          ['Phường Tân Thành', '14329'],
          ['Phường Vân Giang', '14329'],
          ['Xã Ninh An', '14359'],
          ['Xã Ninh Hải', '14359'],
          ['Xã Ninh Hòa', '14533'],
          ['Xã Ninh Khang', '14329'],
          ['Xã Ninh Nhất', '14329'],
          ['Xã Ninh Tiến', '14329'],
          ['Xã Ninh Vân', '14359'],
          ['Xã Trường Yên', '14533']
        ]
      },
      {
        oldDistrict: 'Thành phố Tam Điệp',
        wards: [
          ['Phường Bắc Sơn', '14362'],
          ['Phường Nam Sơn', '14365'],
          ['Phường Tân Bình', '14371'],
          ['Phường Tây Sơn', '14362'],
          ['Phường Trung Sơn', '14365'],
          ['Phường Yên Bình', '14725'],
          ['Xã Đông Sơn', '14365'],
          ['Xã Quang Sơn', '14362'],
          ['Xã Yên Sơn', '14371']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Ninh Thuận',
    districts: [
      {
        oldDistrict: 'Huyện Bác Ái',
        wards: [
          ['Xã Phước Bình', '22786'],
          ['Xã Phước Chính', '22795'],
          ['Xã Phước Đại', '22801'],
          ['Xã Phước Hòa', '22786'],
          ['Xã Phước Tân', '22786'],
          ['Xã Phước Thành', '22801'],
          ['Xã Phước Thắng', '22795'],
          ['Xã Phước Tiến', '22795'],
          ['Xã Phước Trung', '22822']
        ]
      },
      {
        oldDistrict: 'Huyện Ninh Hải',
        wards: [
          ['Thị trấn Khánh Hải', '22834'],
          ['Xã Hộ Hải', '22861'],
          ['Xã Nhơn Hải', '22846'],
          ['Xã Phương Hải', '22852'],
          ['Xã Tân Hải', '22861'],
          ['Xã Thanh Hải', '22846'],
          ['Xã Tri Hải', '22852'],
          ['Xã Vĩnh Hải', '22846'],
          ['Xã Xuân Hải', '22861']
        ]
      },
      {
        oldDistrict: 'Huyện Ninh Phước',
        wards: [
          ['Thị trấn Phước Dân', '22870'],
          ['Xã An Hải', '22888'],
          ['Xã Phước Hải', '22870'],
          ['Xã Phước Hậu', '22873'],
          ['Xã Phước Hữu', '22891'],
          ['Xã Phước Sơn', '22873'],
          ['Xã Phước Thái', '22891'],
          ['Xã Phước Thuận', '22870'],
          ['Xã Phước Vinh', '22873']
        ]
      },
      {
        oldDistrict: 'Huyện Ninh Sơn',
        wards: [
          ['Thị trấn Tân Sơn', '22810'],
          ['Xã Hòa Sơn', '22828'],
          ['Xã Lâm Sơn', '22813'],
          ['Xã Lương Sơn', '22813'],
          ['Xã Ma Nới', '22828'],
          ['Xã Mỹ Sơn', '22822'],
          ['Xã Nhơn Sơn', '22738'],
          ['Xã Quảng Sơn', '22810']
        ]
      },
      {
        oldDistrict: 'Huyện Thuận Bắc',
        wards: [
          ['Xã Bắc Phong', '22849'],
          ['Xã Bắc Sơn', '22852'],
          ['Xã Công Hải', '22840'],
          ['Xã Lợi Hải', '22849'],
          ['Xã Phước Chiến', '22840'],
          ['Xã Phước Kháng', '22849']
        ]
      },
      {
        oldDistrict: 'Huyện Thuận Nam',
        wards: [
          ['Xã Cà Ná', '22909'],
          ['Xã Nhị Hà', '22900'],
          ['Xã Phước Diêm', '22909'],
          ['Xã Phước Dinh', '22888'],
          ['Xã Phước Hà', '22900'],
          ['Xã Phước Minh', '22897'],
          ['Xã Phước Nam', '22897'],
          ['Xã Phước Ninh', '22897']
        ]
      },
      {
        oldDistrict: 'Thành phố Phan Rang-Tháp Chàm',
        wards: [
          ['Phường Bảo An', '22741'],
          ['Phường Đài Sơn', '22759'],
          ['Phường Đạo Long', '22759'],
          ['Phường Đô Vinh', '22738'],
          ['Phường Đông Hải', '22780'],
          ['Phường Kinh Dinh', '22759'],
          ['Phường Mỹ Bình', '22780'],
          ['Phường Mỹ Đông', '22780'],
          ['Phường Mỹ Hải', '22780'],
          ['Phường Phủ Hà', '22759'],
          ['Phường Phước Mỹ', '22741'],
          ['Phường Văn Hải', '22834'],
          ['Xã Thành Hải', '22741']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Phú Thọ',
    districts: [
      {
        oldDistrict: 'Huyện Cẩm Khê',
        wards: [
          ['Thị trấn Cẩm Khê', '08341'],
          ['Xã Điêu Lương', '08431'],
          ['Xã Đồng Lương', '08431'],
          ['Xã Hùng Việt', '08416'],
          ['Xã Hương Lung', '08398'],
          ['Xã Minh Tân', '08341'],
          ['Xã Minh Thắng', '08344'],
          ['Xã Nhật Tiến', '08416'],
          ['Xã Phong Thịnh', '08341'],
          ['Xã Phú Khê', '08398'],
          ['Xã Phượng Vĩ', '08344'],
          ['Xã Tam Sơn', '08377'],
          ['Xã Tiên Lương', '08344'],
          ['Xã Tùng Khê', '08377'],
          ['Xã Văn Bán', '08377'],
          ['Xã Yên Dưỡng', '08431']
        ]
      },
      {
        oldDistrict: 'Huyện Đoan Hùng',
        wards: [
          ['Thị trấn Đoan Hùng', '07969'],
          ['Xã Bằng Doãn', '07996'],
          ['Xã Bằng Luân', '07996'],
          ['Xã Ca Đình', '08023'],
          ['Xã Chân Mộng', '08038'],
          ['Xã Chí Đám', '07999'],
          ['Xã Hợp Nhất', '07969'],
          ['Xã Hùng Long', '08038'],
          ['Xã Hùng Xuyên', '07999'],
          ['Xã Ngọc Quan', '07969'],
          ['Xã Phú Lâm', '08023'],
          ['Xã Phúc Lai', '07996'],
          ['Xã Tây Cốc', '08023'],
          ['Xã Yên Kiện', '08038']
        ]
      },
      {
        oldDistrict: 'Huyện Hạ Hoà',
        wards: [
          ['Thị trấn Hạ Hoà', '08053'],
          ['Xã Ấm Hạ', '08053'],
          ['Xã Bằng Giã', '08134'],
          ['Xã Đại Phạm', '08071'],
          ['Xã Đan Thượng', '08071'],
          ['Xã Gia Điền', '08053'],
          ['Xã Hà Lương', '08071'],
          ['Xã Hiền Lương', '08110'],
          ['Xã Hương Xạ', '08113'],
          ['Xã Lang Sơn', '08143'],
          ['Xã Minh Côi', '08134'],
          ['Xã Minh Hạc', '08053'],
          ['Xã Phương Viên', '08113'],
          ['Xã Tứ Hiệp', '08071'],
          ['Xã Văn Lang', '08134'],
          ['Xã Vĩnh Chân', '08143'],
          ['Xã Vô Tranh', '08134'],
          ['Xã Xuân Áng', '08110'],
          ['Xã Yên Kỳ', '08113'],
          ['Xã Yên Luật', '08143']
        ]
      },
      {
        oldDistrict: 'Huyện Lâm Thao',
        wards: [
          ['Thị trấn Hùng Sơn', '08494'],
          ['Thị trấn Lâm Thao', '08494'],
          ['Xã Bản Nguyên', '08527'],
          ['Xã Cao Xá', '08527'],
          ['Xã Phùng Nguyên', '08521'],
          ['Xã Sơn Vi', '08521'],
          ['Xã Thạch Sơn', '08494'],
          ['Xã Tiên Kiên', '08500'],
          ['Xã Tứ Xã', '08521'],
          ['Xã Vĩnh Lại', '08527'],
          ['Xã Xuân Huy', '08500'],
          ['Xã Xuân Lũng', '08500']
        ]
      },
      {
        oldDistrict: 'Huyện Phù Ninh',
        wards: [
          ['Thị trấn Phong Châu', '08230'],
          ['Xã An Đạo', '08275'],
          ['Xã Bảo Thanh', '08254'],
          ['Xã Bình Phú', '08275'],
          ['Xã Gia Thanh', '08254'],
          ['Xã Hạ Giáp', '08254'],
          ['Xã Lệ Mỹ', '08236'],
          ['Xã Liên Hoa', '08236'],
          ['Xã Phú Lộc', '08230'],
          ['Xã Phú Mỹ', '08236'],
          ['Xã Phú Nham', '08230'],
          ['Xã Phù Ninh', '08230'],
          ['Xã Tiên Du', '08275'],
          ['Xã Tiên Phú', '08245'],
          ['Xã Trạm Thản', '08245'],
          ['Xã Trị Quận', '08254'],
          ['Xã Trung Giáp', '08245']
        ]
      },
      {
        oldDistrict: 'Huyện Tam Nông',
        wards: [
          ['Thị trấn Hưng Hoá', '08434'],
          ['Xã Bắc Sơn', '08443'],
          ['Xã Dân Quyền', '08434'],
          ['Xã Dị Nậu', '08479'],
          ['Xã Hiền Quan', '08443'],
          ['Xã Hương Nộn', '08434'],
          ['Xã Lam Sơn', '08467'],
          ['Xã Quang Húc', '08467'],
          ['Xã Tề Lễ', '08479'],
          ['Xã Thanh Uyên', '08443'],
          ['Xã Thọ Văn', '08479'],
          ['Xã Vạn Xuân', '08467']
        ]
      },
      {
        oldDistrict: 'Huyện Tân Sơn',
        wards: [
          ['Thị trấn Tân Phú', '08566'],
          ['Xã Đồng Sơn', '08560'],
          ['Xã Kiệt Sơn', '08560'],
          ['Xã Kim Thượng', '08590'],
          ['Xã Lai Đồng', '08560'],
          ['Xã Long Cốc', '08620'],
          ['Xã Minh Đài', '08593'],
          ['Xã Mỹ Thuận', '08593'],
          ['Xã Tam Thanh', '08620'],
          ['Xã Tân Sơn', '08560'],
          ['Xã Thạch Kiệt', '08566'],
          ['Xã Thu Cúc', '08545'],
          ['Xã Thu Ngạc', '08566'],
          ['Xã Văn Luông', '08593'],
          ['Xã Vinh Tiền', '08620'],
          ['Xã Xuân Đài', '08590'],
          ['Xã Xuân Sơn', '08590']
        ]
      },
      {
        oldDistrict: 'Huyện Thanh Ba',
        wards: [
          ['Thị trấn Thanh Ba', '08152'],
          ['Xã Chí Tiên', '08218'],
          ['Xã Đại An', '08173'],
          ['Xã Đỗ Sơn', '08227'],
          ['Xã Đỗ Xuyên', '08227'],
          ['Xã Đông Lĩnh', '08173'],
          ['Xã Đông Thành', '08209'],
          ['Xã Đồng Xuân', '08152'],
          ['Xã Hanh Cù', '08152'],
          ['Xã Hoàng Cương', '08203'],
          ['Xã Khải Xuân', '08209'],
          ['Xã Lương Lỗ', '08227'],
          ['Xã Mạn Lạn', '08203'],
          ['Xã Ninh Dân', '08203'],
          ['Xã Quảng Yên', '08173'],
          ['Xã Sơn Cương', '08218'],
          ['Xã Thanh Hà', '08218'],
          ['Xã Vân Lĩnh', '08152'],
          ['Xã Võ Lao', '08209']
        ]
      },
      {
        oldDistrict: 'Huyện Thanh Sơn',
        wards: [
          ['Thị trấn Thanh Sơn', '08542'],
          ['Xã Cự Đồng', '08614'],
          ['Xã Cự Thắng', '08584'],
          ['Xã Địch Quả', '08584'],
          ['Xã Đông Cửu', '08635'],
          ['Xã Giáp Lai', '08542'],
          ['Xã Hương Cần', '08632'],
          ['Xã Khả Cửu', '08635'],
          ['Xã Lương Nha', '08656'],
          ['Xã Sơn Hùng', '08542'],
          ['Xã Tân Lập', '08611'],
          ['Xã Tân Minh', '08611'],
          ['Xã Tất Thắng', '08614'],
          ['Xã Thạch Khoán', '08542'],
          ['Xã Thắng Sơn', '08614'],
          ['Xã Thục Luyện', '08542'],
          ['Xã Thượng Cửu', '08635'],
          ['Xã Tinh Nhuệ', '08656'],
          ['Xã Văn Miếu', '08611'],
          ['Xã Võ Miếu', '08584'],
          ['Xã Yên Lãng', '08632'],
          ['Xã Yên Lương', '08632'],
          ['Xã Yên Sơn', '08656']
        ]
      },
      {
        oldDistrict: 'Huyện Thanh Thuỷ',
        wards: [
          ['Thị trấn Thanh Thủy', '08674'],
          ['Xã Bảo Yên', '08674'],
          ['Xã Đào Xá', '08662'],
          ['Xã Đoan Hạ', '08674'],
          ['Xã Đồng Trung', '08686'],
          ['Xã Hoàng Xá', '08686'],
          ['Xã Sơn Thủy', '08674'],
          ['Xã Tân Phương', '08662'],
          ['Xã Thạch Đồng', '08662'],
          ['Xã Tu Vũ', '08686'],
          ['Xã Xuân Lộc', '08662']
        ]
      },
      {
        oldDistrict: 'Huyện Yên Lập',
        wards: [
          ['Thị trấn Yên Lập', '08290'],
          ['Xã Đồng Lạc', '08290'],
          ['Xã Đồng Thịnh', '08290'],
          ['Xã Hưng Long', '08290'],
          ['Xã Lương Sơn', '08296'],
          ['Xã Minh Hòa', '08338'],
          ['Xã Mỹ Lung', '08296'],
          ['Xã Mỹ Lương', '08296'],
          ['Xã Nga Hoàng', '08323'],
          ['Xã Ngọc Đồng', '08338'],
          ['Xã Ngọc Lập', '08338'],
          ['Xã Phúc Khánh', '08323'],
          ['Xã Thượng Long', '08323'],
          ['Xã Trung Sơn', '08311'],
          ['Xã Xuân An', '08305'],
          ['Xã Xuân Thủy', '08305'],
          ['Xã Xuân Viên', '08305']
        ]
      },
      {
        oldDistrict: 'Thành phố Việt Trì',
        wards: [
          ['Phường Bạch Hạc', '07909'],
          ['Phường Dữu Lâu', '07900'],
          ['Phường Gia Cẩm', '07900'],
          ['Phường Minh Nông', '07900'],
          ['Phường Minh Phương', '07894'],
          ['Phường Nông Trang', '07894'],
          ['Phường Tân Dân', '07900'],
          ['Phường Thanh Miếu', '07909'],
          ['Phường Thọ Sơn', '07909'],
          ['Phường Tiên Cát', '07909'],
          ['Phường Vân Phú', '07918'],
          ['Xã Chu Hóa', '08515'],
          ['Xã Hùng Lô', '07918'],
          ['Xã Hy Cương', '08515'],
          ['Xã Kim Đức', '07918'],
          ['Xã Phượng Lâu', '07918'],
          ['Xã Sông Lô', '07909'],
          ['Xã Thanh Đình', '08515'],
          ['Xã Thụy Vân', '07894'],
          ['Xã Trưng Vương', '07900']
        ]
      },
      {
        oldDistrict: 'Thị xã Phú Thọ',
        wards: [
          ['Phường Âu Cơ', '07948'],
          ['Phường Hùng Vương', '07942'],
          ['Phường Phong Châu', '07954'],
          ['Phường Thanh Vinh', '07948'],
          ['Xã Hà Lộc', '07942'],
          ['Xã Hà Thạch', '07954'],
          ['Xã Phú Hộ', '07954'],
          ['Xã Thanh Minh', '07948'],
          ['Xã Văn Lung', '07942']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Phú Yên',
    districts: [
      {
        oldDistrict: 'Huyện Đồng Xuân',
        wards: [
          ['Thị trấn La Hai', '22081'],
          ['Xã Đa Lộc', '22090'],
          ['Xã Phú Mỡ', '22096'],
          ['Xã Xuân Lãnh', '22090'],
          ['Xã Xuân Long', '22081'],
          ['Xã Xuân Phước', '22111'],
          ['Xã Xuân Quang 1', '22096'],
          ['Xã Xuân Quang 2', '22081'],
          ['Xã Xuân Quang 3', '22111'],
          ['Xã Xuân Sơn Bắc', '22081'],
          ['Xã Xuân Sơn Nam', '22081']
        ]
      },
      {
        oldDistrict: 'Huyện Phú Hoà',
        wards: [
          ['Thị trấn Phú Hoà', '22319'],
          ['Xã Hòa An', '22015'],
          ['Xã Hòa Định Đông', '22319'],
          ['Xã Hòa Định Tây', '22319'],
          ['Xã Hòa Hội', '22319'],
          ['Xã Hòa Quang Bắc', '22303'],
          ['Xã Hòa Quang Nam', '22303'],
          ['Xã Hòa Thắng', '22319'],
          ['Xã Hòa Trị', '22303']
        ]
      },
      {
        oldDistrict: 'Huyện Sông Hinh',
        wards: [
          ['Thị trấn Hai Riêng', '22207'],
          ['Xã Đức Bình Đông', '22222'],
          ['Xã Đức Bình Tây', '22222'],
          ['Xã Ea Bá', '22225'],
          ['Xã Ea Lâm', '22237'],
          ['Xã EaBar', '22225'],
          ['Xã EaBia', '22207'],
          ['Xã Ealy', '22237'],
          ['Xã EaTrol', '22207'],
          ['Xã Sông Hinh', '22207'],
          ['Xã Sơn Giang', '22222']
        ]
      },
      {
        oldDistrict: 'Huyện Sơn Hòa',
        wards: [
          ['Thị trấn Củng Sơn', '22165'],
          ['Xã Cà Lúi', '22171'],
          ['Xã Eachà Rang', '22192'],
          ['Xã Krông Pa', '22192'],
          ['Xã Phước Tân', '22171'],
          ['Xã Sơn Định', '22177'],
          ['Xã Sơn Hà', '22165'],
          ['Xã Sơn Hội', '22171'],
          ['Xã Sơn Long', '22177'],
          ['Xã Sơn Nguyên', '22165'],
          ['Xã Sơn Phước', '22165'],
          ['Xã Sơn Xuân', '22177'],
          ['Xã Suối Bạc', '22165'],
          ['Xã Suối Trai', '22192']
        ]
      },
      {
        oldDistrict: 'Huyện Tây Hoà',
        wards: [
          ['Thị trấn Phú Thứ', '22255'],
          ['Xã Hòa Bình 1', '22255'],
          ['Xã Hòa Đồng', '22276'],
          ['Xã Hòa Mỹ Đông', '22285'],
          ['Xã Hòa Mỹ Tây', '22285'],
          ['Xã Hòa Phong', '22255'],
          ['Xã Hòa Phú', '22250'],
          ['Xã Hòa Tân Tây', '22255'],
          ['Xã Hòa Thịnh', '22276'],
          ['Xã Sơn Thành Đông', '22250'],
          ['Xã Sơn Thành Tây', '22250']
        ]
      },
      {
        oldDistrict: 'Huyện Tuy An',
        wards: [
          ['Thị trấn Chí Thạnh', '22114'],
          ['Xã An Chấn', '22153'],
          ['Xã An Cư', '22147'],
          ['Xã An Dân', '22114'],
          ['Xã An Định', '22114'],
          ['Xã An Hiệp', '22147'],
          ['Xã An Hòa Hải', '22147'],
          ['Xã An Lĩnh', '22132'],
          ['Xã An Mỹ', '22153'],
          ['Xã An Nghiệp', '22132'],
          ['Xã An Ninh Đông', '22120'],
          ['Xã An Ninh Tây', '22120'],
          ['Xã An Thạch', '22120'],
          ['Xã An Thọ', '22153'],
          ['Xã An Xuân', '22132']
        ]
      },
      {
        oldDistrict: 'Thành phố Tuy Hoà',
        wards: [
          ['Phường 1', '22015'],
          ['Phường 2', '22015'],
          ['Phường 4', '22015'],
          ['Phường 5', '22015'],
          ['Phường 7', '22015'],
          ['Phường 9', '22045'],
          ['Phường Phú Đông', '22240'],
          ['Phường Phú Lâm', '22240'],
          ['Phường Phú Thạnh', '22240'],
          ['Xã An Phú', '22045'],
          ['Xã Bình Kiến', '22045'],
          ['Xã Hòa Kiến', '22045']
        ]
      },
      {
        oldDistrict: 'Thị xã Đông Hòa',
        wards: [
          ['Phường Hòa Hiệp Bắc', '22261'],
          ['Phường Hòa Hiệp Nam', '22261'],
          ['Phường Hoà Hiệp Trung', '22261'],
          ['Phường Hoà Vinh', '22258'],
          ['Phường Hòa Xuân Tây', '22258'],
          ['Xã Hòa Tâm', '22291'],
          ['Xã Hòa Tân Đông', '22258'],
          ['Xã Hòa Thành', '22240'],
          ['Xã Hòa Xuân Đông', '22291'],
          ['Xã Hòa Xuân Nam', '22291']
        ]
      },
      {
        oldDistrict: 'Thị xã Sông Cầu',
        wards: [
          ['Phường Xuân Đài', '22076'],
          ['Phường Xuân Phú', '22051'],
          ['Phường Xuân Thành', '22076'],
          ['Phường Xuân Yên', '22051'],
          ['Xã Xuân Bình', '22060'],
          ['Xã Xuân Cảnh', '22060'],
          ['Xã Xuân Hải', '22057'],
          ['Xã Xuân Lâm', '22075'],
          ['Xã Xuân Lộc', '22057'],
          ['Xã Xuân Phương', '22051'],
          ['Xã Xuân Thịnh', '22051'],
          ['Xã Xuân Thọ 1', '22075'],
          ['Xã Xuân Thọ 2', '22075']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Quảng Bình',
    districts: [
      {
        oldDistrict: 'Huyện Bố Trạch',
        wards: [
          ['Thị trấn Hoàn Lão', '19111'],
          ['Thị trấn Phong Nha', '19138'],
          ['Thị trấn Việt Trung', '19198'],
          ['Xã Bắc Trạch', '19126'],
          ['Xã Cự Nẫm', '19141'],
          ['Xã Đại Trạch', '19111'],
          ['Xã Đồng Trạch', '19159'],
          ['Xã Đức Trạch', '19159'],
          ['Xã Hạ Mỹ', '19126'],
          ['Xã Hải Phú', '19159'],
          ['Xã Hòa Trạch', '19111'],
          ['Xã Hưng Trạch', '19141'],
          ['Xã Lâm Trạch', '19138'],
          ['Xã Liên Trạch', '19126'],
          ['Xã Lý Nam', '19198'],
          ['Xã Nhân Trạch', '19198'],
          ['Xã Phú Định', '19141'],
          ['Xã Phúc Trạch', '19138'],
          ['Xã Sơn Lộc', '19159'],
          ['Xã Tân Trạch', '19147'],
          ['Xã Tây Trạch', '19111'],
          ['Xã Thanh Trạch', '19126'],
          ['Xã Thượng Trạch', '19147'],
          ['Xã Trung Trạch', '19111'],
          ['Xã Vạn Trạch', '19141'],
          ['Xã Xuân Trạch', '19138']
        ]
      },
      {
        oldDistrict: 'Huyện Lệ Thủy',
        wards: [
          ['Thị trấn Kiến Giang', '19249'],
          ['Thị trấn Lệ Ninh', '19246'],
          ['Xã An Thủy', '19249'],
          ['Xã Cam Thủy', '19255'],
          ['Xã Dương Thủy', '19291'],
          ['Xã Hoa Thủy', '19246'],
          ['Xã Hồng Thủy', '19255'],
          ['Xã Hưng Thủy', '19288'],
          ['Xã Kim Thủy', '19318'],
          ['Xã Lâm Thủy', '19318'],
          ['Xã Liên Thủy', '19249'],
          ['Xã Lộc Thủy', '19249'],
          ['Xã Mai Thủy', '19309'],
          ['Xã Mỹ Thủy', '19291'],
          ['Xã Ngân Thủy', '19318'],
          ['Xã Ngư Thủy', '19288'],
          ['Xã Ngư Thủy Bắc', '19255'],
          ['Xã Phong Thủy', '19249'],
          ['Xã Phú Thủy', '19309'],
          ['Xã Sen Thủy', '19288'],
          ['Xã Sơn Thủy', '19246'],
          ['Xã Tân Thủy', '19291'],
          ['Xã Thái Thủy', '19291'],
          ['Xã Thanh Thủy', '19255'],
          ['Xã Trường Thủy', '19309'],
          ['Xã Xuân Thủy', '19249']
        ]
      },
      {
        oldDistrict: 'Huyện Minh Hóa',
        wards: [
          ['Thị trấn Quy Đạt', '18901'],
          ['Xã Dân Hóa', '18904'],
          ['Xã Hóa Hợp', '18922'],
          ['Xã Hóa Sơn', '18922'],
          ['Xã Hồng Hóa', '18901'],
          ['Xã Minh Hóa', '18943'],
          ['Xã Tân Hóa', '18943'],
          ['Xã Tân Thành', '18919'],
          ['Xã Thượng Hóa', '18943'],
          ['Xã Trọng Hóa', '18904'],
          ['Xã Trung Hóa', '18943'],
          ['Xã Xuân Hóa', '18901'],
          ['Xã Yên Hóa', '18901']
        ]
      },
      {
        oldDistrict: 'Huyện Quảng Ninh',
        wards: [
          ['Thị trấn Quán Hàu', '19207'],
          ['Xã An Ninh', '19237'],
          ['Xã Duy Ninh', '19225'],
          ['Xã Gia Ninh', '19225'],
          ['Xã Hải Ninh', '19225'],
          ['Xã Hàm Ninh', '19207'],
          ['Xã Hiền Ninh', '19237'],
          ['Xã Tân Ninh', '19225'],
          ['Xã Trường Sơn', '19204'],
          ['Xã Trường Xuân', '19204'],
          ['Xã Vạn Ninh', '19237'],
          ['Xã Vĩnh Ninh', '19207'],
          ['Xã Võ Ninh', '19207'],
          ['Xã Xuân Ninh', '19237']
        ]
      },
      {
        oldDistrict: 'Huyện Quảng Trạch',
        wards: [
          ['Xã Cảnh Dương', '19033'],
          ['Xã Liên Trường', '19051'],
          ['Xã Phù Cảnh', '19051'],
          ['Xã Quảng Châu', '19033'],
          ['Xã Quảng Đông', '19021'],
          ['Xã Quảng Hợp', '19021'],
          ['Xã Quảng Hưng', '19057'],
          ['Xã Quảng Kim', '19021'],
          ['Xã Quảng Lưu', '19030'],
          ['Xã Quảng Phú', '19021'],
          ['Xã Quảng Phương', '19057'],
          ['Xã Quảng Thạch', '19030'],
          ['Xã Quảng Thanh', '19051'],
          ['Xã Quảng Tiến', '19030'],
          ['Xã Quảng Tùng', '19033'],
          ['Xã Quảng Xuân', '19057']
        ]
      },
      {
        oldDistrict: 'Huyện Tuyên Hóa',
        wards: [
          ['Thị trấn Đồng Lê', '18949'],
          ['Xã Cao Quảng', '18997'],
          ['Xã Châu Hóa', '18997'],
          ['Xã Đồng Hóa', '18985'],
          ['Xã Đức Hóa', '18985'],
          ['Xã Hương Hóa', '18952'],
          ['Xã Kim Hóa', '18949'],
          ['Xã Lâm Hóa', '18958'],
          ['Xã Lê Hóa', '18949'],
          ['Xã Mai Hóa', '18991'],
          ['Xã Ngư Hóa', '18991'],
          ['Xã Phong Hóa', '18991'],
          ['Xã Sơn Hóa', '18949'],
          ['Xã Thạch Hóa', '18985'],
          ['Xã Thanh Hóa', '18958'],
          ['Xã Thanh Thạch', '18952'],
          ['Xã Thuận Hóa', '18949'],
          ['Xã Tiến Hóa', '18997'],
          ['Xã Văn Hóa', '18997']
        ]
      },
      {
        oldDistrict: 'Thành phố Đồng Hới',
        wards: [
          ['Phường Bắc Lý', '18859'],
          ['Phường Bắc Nghĩa', '18871'],
          ['Phường Đồng Hải', '18880'],
          ['Phường Đồng Phú', '18880'],
          ['Phường Đồng Sơn', '18871'],
          ['Phường Đức Ninh Đông', '18880'],
          ['Phường Hải Thành', '18880'],
          ['Phường Nam Lý', '18880'],
          ['Phường Phú Hải', '18880'],
          ['Xã Bảo Ninh', '18880'],
          ['Xã Đức Ninh', '18880'],
          ['Xã Lộc Ninh', '18859'],
          ['Xã Nghĩa Ninh', '18871'],
          ['Xã Quang Phú', '18859'],
          ['Xã Thuận Đức', '18871']
        ]
      },
      {
        oldDistrict: 'Thị xã Ba Đồn',
        wards: [
          ['Phường Ba Đồn', '19009'],
          ['Phường Quảng Long', '19009'],
          ['Phường Quảng Phong', '19009'],
          ['Phường Quảng Phúc', '19066'],
          ['Phường Quảng Thọ', '19066'],
          ['Phường Quảng Thuận', '19066'],
          ['Xã Quảng Hải', '19009'],
          ['Xã Quảng Hòa', '19093'],
          ['Xã Quảng Lộc', '19093'],
          ['Xã Quảng Minh', '19093'],
          ['Xã Quảng Sơn', '19075'],
          ['Xã Quảng Tân', '19075'],
          ['Xã Quảng Thủy', '19075'],
          ['Xã Quảng Tiên', '19075'],
          ['Xã Quảng Trung', '19075'],
          ['Xã Quảng Văn', '19093']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Quảng Nam',
    districts: [
      {
        oldDistrict: 'Huyện Bắc Trà My',
        wards: [
          ['Thị trấn Trà My', '20900'],
          ['Xã Trà Bui', '20920'],
          ['Xã Trà Dương', '20900'],
          ['Xã Trà Đốc', '20920'],
          ['Xã Trà Đông', '20908'],
          ['Xã Trà Giác', '20923'],
          ['Xã Trà Giang', '20900'],
          ['Xã Trà Giáp', '20929'],
          ['Xã Trà Ka', '20929'],
          ['Xã Trà Kót', '20908'],
          ['Xã Trà Nú', '20908'],
          ['Xã Trà Sơn', '20900'],
          ['Xã Trà Tân', '20923']
        ]
      },
      {
        oldDistrict: 'Huyện Duy Xuyên',
        wards: [
          ['Thị trấn Nam Phước', '20599'],
          ['Xã Duy Châu', '20611'],
          ['Xã Duy Hải', '20635'],
          ['Xã Duy Hòa', '20611'],
          ['Xã Duy Nghĩa', '20635'],
          ['Xã Duy Phú', '20611'],
          ['Xã Duy Phước', '20599'],
          ['Xã Duy Sơn', '20623'],
          ['Xã Duy Tân', '20611'],
          ['Xã Duy Thành', '20635'],
          ['Xã Duy Trinh', '20623'],
          ['Xã Duy Trung', '20623'],
          ['Xã Duy Vinh', '20599']
        ]
      },
      {
        oldDistrict: 'Huyện Đại Lộc',
        wards: [
          ['Thị trấn Ái Nghĩa', '20500'],
          ['Xã Đại An', '20500'],
          ['Xã Đại Chánh', '20542'],
          ['Xã Đại Cường', '20539'],
          ['Xã Đại Đồng', '20515'],
          ['Xã Đại Hiệp', '20500'],
          ['Xã Đại Hòa', '20500'],
          ['Xã Đại Hồng', '20515'],
          ['Xã Đại Hưng', '20506'],
          ['Xã Đại Lãnh', '20506'],
          ['Xã Đại Minh', '20539'],
          ['Xã Đại Nghĩa', '20500'],
          ['Xã Đại Phong', '20539'],
          ['Xã Đại Quang', '20515'],
          ['Xã Đại Sơn', '20506'],
          ['Xã Đại Tân', '20542'],
          ['Xã Đại Thạnh', '20542'],
          ['Xã Đại Thắng', '20542']
        ]
      },
      {
        oldDistrict: 'Huyện Đông Giang',
        wards: [
          ['Thị trấn P Rao', '20467'],
          ['Xã A Rooi', '20467'],
          ['Xã A Ting', '20476'],
          ['Xã Ba', '20485'],
          ['Xã Jơ Ngây', '20476'],
          ['Xã Ka Dăng', '20494'],
          ['Xã Mà Cooi', '20494'],
          ['Xã Sông Kôn', '20476'],
          ['Xã Tà Lu', '20467'],
          ['Xã Tư', '20485'],
          ['Xã Za Hung', '20467']
        ]
      },
      {
        oldDistrict: 'Huyện Hiệp Đức',
        wards: [
          ['Thị trấn Tân Bình', '20779'],
          ['Xã Bình Lâm', '20767'],
          ['Xã Bình Sơn', '20767'],
          ['Xã Phước Gia', '20770'],
          ['Xã Phước Trà', '20770'],
          ['Xã Quế Lưu', '20779'],
          ['Xã Quế Tân', '20779'],
          ['Xã Quế Thọ', '20767'],
          ['Xã Sông Trà', '20770'],
          ['Xã Thăng Phước', '20767']
        ]
      },
      {
        oldDistrict: 'Huyện Nam Giang',
        wards: [
          ['Thị trấn Thạnh Mỹ', '20695'],
          ['Xã Cà Dy', '20710'],
          ['Xã Chà Vàl', '20707'],
          ['Xã Chơ Chun', '20698'],
          ['Xã Đắc Pre', '20716'],
          ['Xã Đắc Pring', '20716'],
          ['Xã Đắc Tôi', '20704'],
          ['Xã La Dêê', '20704'],
          ['Xã Laêê', '20698'],
          ['Xã Tà Bhinh', '20710'],
          ['Xã Tà Pơơ', '20710'],
          ['Xã Zuôich', '20707']
        ]
      },
      {
        oldDistrict: 'Huyện Nam Trà My',
        wards: [
          ['Xã Trà Cang', '20941'],
          ['Xã Trà Don', '20944'],
          ['Xã Trà Dơn', '20938'],
          ['Xã Trà Leng', '20938'],
          ['Xã Trà Linh', '20950'],
          ['Xã Trà Mai', '20944'],
          ['Xã Trà Nam', '20950'],
          ['Xã Trà Tập', '20941'],
          ['Xã Trà Vân', '20959'],
          ['Xã Trà Vinh', '20959']
        ]
      },
      {
        oldDistrict: 'Huyện Núi Thành',
        wards: [
          ['Thị trấn Núi Thành', '20965'],
          ['Xã Tam Anh Bắc', '20984'],
          ['Xã Tam Anh Nam', '20984'],
          ['Xã Tam Giang', '20965'],
          ['Xã Tam Hải', '20992'],
          ['Xã Tam Hiệp', '20965'],
          ['Xã Tam Hòa', '20984'],
          ['Xã Tam Mỹ Đông', '21004'],
          ['Xã Tam Mỹ Tây', '21004'],
          ['Xã Tam Nghĩa', '20965'],
          ['Xã Tam Quang', '20965'],
          ['Xã Tam Sơn', '20977'],
          ['Xã Tam Thạnh', '20977'],
          ['Xã Tam Tiến', '20971'],
          ['Xã Tam Trà', '21004'],
          ['Xã Tam Xuân I', '20971'],
          ['Xã Tam Xuân II', '20971']
        ]
      },
      {
        oldDistrict: 'Huyện Phú Ninh',
        wards: [
          ['Thị trấn Phú Thịnh', '20364'],
          ['Xã Tam An', '20380'],
          ['Xã Tam Dân', '20392'],
          ['Xã Tam Đại', '20392'],
          ['Xã Tam Đàn', '20364'],
          ['Xã Tam Lãnh', '20392'],
          ['Xã Tam Lộc', '20380'],
          ['Xã Tam Phước', '20380'],
          ['Xã Tam Thái', '20364'],
          ['Xã Tam Thành', '20380']
        ]
      },
      {
        oldDistrict: 'Huyện Phước Sơn',
        wards: [
          ['Thị trấn Khâm Đức', '20722'],
          ['Xã Phước Chánh', '20740'],
          ['Xã Phước Công', '20740'],
          ['Xã Phước Đức', '20734'],
          ['Xã Phước Hiệp', '20728'],
          ['Xã Phước Hoà', '20728'],
          ['Xã Phước Kim', '20752'],
          ['Xã Phước Lộc', '20752'],
          ['Xã Phước Mỹ', '20734'],
          ['Xã Phước Năng', '20734'],
          ['Xã Phước Thành', '20752'],
          ['Xã Phước Xuân', '20722']
        ]
      },
      {
        oldDistrict: 'Huyện Quế Sơn',
        wards: [
          ['Thị trấn Đông Phú', '20641'],
          ['Thị trấn Hương An', '20650'],
          ['Thị trấn Trung Phước', '20656'],
          ['Xã Ninh Phước', '20669'],
          ['Xã Phước Ninh', '20669'],
          ['Xã Quế An', '20641'],
          ['Xã Quế Châu', '20662'],
          ['Xã Quế Hiệp', '20662'],
          ['Xã Quế Lâm', '20669'],
          ['Xã Quế Long', '20641'],
          ['Xã Quế Lộc', '20656'],
          ['Xã Quế Minh', '20641'],
          ['Xã Quế Mỹ', '20662'],
          ['Xã Quế Phong', '20641'],
          ['Xã Quế Phú', '20650'],
          ['Xã Quế Thuận', '20662'],
          ['Xã Quế Xuân 1', '20650'],
          ['Xã Quế Xuân 2', '20650']
        ]
      },
      {
        oldDistrict: 'Huyện Tây Giang',
        wards: [
          ['Xã A Nông', '20455'],
          ['Xã A Tiêng', '20455'],
          ['Xã A Vương', '20458'],
          ['Xã A Xan', '20443'],
          ['Xã Bha Lê', '20458'],
          ["Xã Ch'ơm", '20443'],
          ['Xã Dang', '20455'],
          ['Xã Ga Ri', '20443'],
          ['Xã Lăng', '20455'],
          ["Xã Tr'Hy", '20443']
        ]
      },
      {
        oldDistrict: 'Huyện Thăng Bình',
        wards: [
          ['Thị trấn Hà Lam', '20791'],
          ['Xã Bình An', '20848'],
          ['Xã Bình Dương', '20794'],
          ['Xã Bình Đào', '20794'],
          ['Xã Bình Định', '20818'],
          ['Xã Bình Giang', '20794'],
          ['Xã Bình Hải', '20836'],
          ['Xã Bình Lãnh', '20818'],
          ['Xã Bình Minh', '20794'],
          ['Xã Bình Nam', '20836'],
          ['Xã Bình Nguyên', '20791'],
          ['Xã Bình Phú', '20827'],
          ['Xã Bình Phục', '20791'],
          ['Xã Bình Quế', '20827'],
          ['Xã Bình Quý', '20791'],
          ['Xã Bình Sa', '20836'],
          ['Xã Bình Trị', '20818'],
          ['Xã Bình Triều', '20794'],
          ['Xã Bình Trung', '20848'],
          ['Xã Bình Tú', '20848']
        ]
      },
      {
        oldDistrict: 'Huyện Tiên Phước',
        wards: [
          ['Thị trấn Tiên Kỳ', '20854'],
          ['Xã Tiên An', '20878'],
          ['Xã Tiên Cảnh', '20878'],
          ['Xã Tiên Châu', '20857'],
          ['Xã Tiên Hà', '20857'],
          ['Xã Tiên Hiệp', '20875'],
          ['Xã Tiên Lãnh', '20875'],
          ['Xã Tiên Lập', '20878'],
          ['Xã Tiên Lộc', '20878'],
          ['Xã Tiên Mỹ', '20854'],
          ['Xã Tiên Ngọc', '20875'],
          ['Xã Tiên Phong', '20854'],
          ['Xã Tiên Sơn', '20857'],
          ['Xã Tiên Thọ', '20854']
        ]
      },
      {
        oldDistrict: 'Thành phố Hội An',
        wards: [
          ['Phường Cẩm An', '20401'],
          ['Phường Cẩm Châu', '20413'],
          ['Phường Cẩm Nam', '20410'],
          ['Phường Cẩm Phô', '20410'],
          ['Phường Cửa Đại', '20413'],
          ['Phường Minh An', '20410'],
          ['Phường Sơn Phong', '20410'],
          ['Phường Tân An', '20401'],
          ['Phường Thanh Hà', '20401'],
          ['Xã Cẩm Hà', '20401'],
          ['Xã Cẩm Kim', '20410'],
          ['Xã Cẩm Thanh', '20413'],
          ['Xã Tân Hiệp', '20434']
        ]
      },
      {
        oldDistrict: 'Thành phố Tam Kỳ',
        wards: [
          ['Phường An Mỹ', '20341'],
          ['Phường An Phú', '20356'],
          ['Phường An Sơn', '20350'],
          ['Phường An Xuân', '20341'],
          ['Phường Hòa Hương', '20350'],
          ['Phường Hoà Thuận', '20335'],
          ['Phường Tân Thạnh', '20335'],
          ['Phường Trường Xuân', '20341'],
          ['Xã Tam Ngọc', '20350'],
          ['Xã Tam Phú', '20356'],
          ['Xã Tam Thanh', '20356'],
          ['Xã Tam Thăng', '20335']
        ]
      },
      {
        oldDistrict: 'Thị xã Điện Bàn',
        wards: [
          ['Phường Điện An', '20575'],
          ['Phường Điện Dương', '20579'],
          ['Phường Điện Minh', '20551'],
          ['Phường Điện Nam Bắc', '20579'],
          ['Phường Điện Nam Đông', '20579'],
          ['Phường Điện Nam Trung', '20579'],
          ['Phường Điện Ngọc', '20579'],
          ['Phường Điện Phương', '20551'],
          ['Phường Điện Thắng Bắc', '20557'],
          ['Phường Điện Thắng Nam', '20575'],
          ['Phường Điện Thắng Trung', '20575'],
          ['Phường Vĩnh Điện', '20551'],
          ['Xã Điện Hòa', '20557'],
          ['Xã Điện Hồng', '20569'],
          ['Xã Điện Phong', '20587'],
          ['Xã Điện Phước', '20569'],
          ['Xã Điện Quang', '20587'],
          ['Xã Điện Thọ', '20569'],
          ['Xã Điện Tiến', '20557'],
          ['Xã Điện Trung', '20587']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Quảng Ngãi',
    districts: [
      {
        oldDistrict: 'Huyện Ba Tơ',
        wards: [
          ['Thị trấn Ba Tơ', '21484'],
          ['Xã Ba Bích', '21484'],
          ['Xã Ba Cung', '21484'],
          ['Xã Ba Dinh', '21499'],
          ['Xã Ba Điền', '21490'],
          ['Xã Ba Động', '21496'],
          ['Xã Ba Giang', '21499'],
          ['Xã Ba Khâm', '21520'],
          ['Xã Ba Lế', '21523'],
          ['Xã Ba Liên', '21496'],
          ['Xã Ba Nam', '21523'],
          ['Xã Ba Ngạc', '21529'],
          ['Xã Ba Thành', '21496'],
          ['Xã Ba Tiêu', '21529'],
          ['Xã Ba Tô', '21523'],
          ['Xã Ba Trang', '21520'],
          ['Xã Ba Vì', '21529'],
          ['Xã Ba Vinh', '21490'],
          ['Xã Ba Xa', '21538']
        ]
      },
      {
        oldDistrict: 'Huyện Bình Sơn',
        wards: [
          ['Thị trấn Châu Ổ', '21040'],
          ['Xã Bình An', '21085'],
          ['Xã Bình Chánh', '21040'],
          ['Xã Bình Châu', '21109'],
          ['Xã Bình Chương', '21100'],
          ['Xã Bình Dương', '21040'],
          ['Xã Bình Đông', '21061'],
          ['Xã Bình Hải', '21061'],
          ['Xã Bình Hiệp', '21109'],
          ['Xã Bình Hòa', '21061'],
          ['Xã Bình Khương', '21085'],
          ['Xã Bình Long', '21040'],
          ['Xã Bình Minh', '21085'],
          ['Xã Bình Mỹ', '21100'],
          ['Xã Bình Nguyên', '21040'],
          ['Xã Bình Phước', '21061'],
          ['Xã Bình Tân Phú', '21109'],
          ['Xã Bình Thạnh', '21040'],
          ['Xã Bình Thanh', '21109'],
          ['Xã Bình Thuận', '21061'],
          ['Xã Bình Trị', '21061'],
          ['Xã Bình Trung', '21040']
        ]
      },
      {
        oldDistrict: 'Huyện Lý Sơn',
        wards: [['Huyện đảo Lý Sơn (không chia phường/xã)', '21548']]
      },
      {
        oldDistrict: 'Huyện Minh Long',
        wards: [
          ['Xã Long Hiệp', '21361'],
          ['Xã Long Mai', '21349'],
          ['Xã Long Môn', '21361'],
          ['Xã Long Sơn', '21349'],
          ['Xã Thanh An', '21361']
        ]
      },
      {
        oldDistrict: 'Huyện Mộ Đức',
        wards: [
          ['Thị trấn Mộ Đức', '21400'],
          ['Xã Đức Chánh', '21421'],
          ['Xã Đức Hiệp', '21409'],
          ['Xã Đức Hòa', '21400'],
          ['Xã Đức Lân', '21433'],
          ['Xã Đức Minh', '21421'],
          ['Xã Đức Nhuận', '21409'],
          ['Xã Đức Phong', '21433'],
          ['Xã Đức Phú', '21400'],
          ['Xã Đức Tân', '21400'],
          ['Xã Đức Thạnh', '21421'],
          ['Xã Thắng Lợi', '21409']
        ]
      },
      {
        oldDistrict: 'Huyện Nghĩa Hành',
        wards: [
          ['Thị trấn Chợ Chùa', '21364'],
          ['Xã Hành Dũng', '21370'],
          ['Xã Hành Đức', '21385'],
          ['Xã Hành Minh', '21370'],
          ['Xã Hành Nhân', '21370'],
          ['Xã Hành Phước', '21385'],
          ['Xã Hành Thiện', '21388'],
          ['Xã Hành Thịnh', '21385'],
          ['Xã Hành Thuận', '21364'],
          ['Xã Hành Tín Đông', '21388'],
          ['Xã Hành Tín Tây', '21388'],
          ['Xã Hành Trung', '21364']
        ]
      },
      {
        oldDistrict: 'Huyện Sơn Hà',
        wards: [
          ['Thị trấn Di Lăng', '21289'],
          ['Xã Sơn Ba', '21325'],
          ['Xã Sơn Bao', '21289'],
          ['Xã Sơn Cao', '21307'],
          ['Xã Sơn Giang', '21307'],
          ['Xã Sơn Hạ', '21292'],
          ['Xã Sơn Hải', '21319'],
          ['Xã Sơn Kỳ', '21325'],
          ['Xã Sơn Linh', '21307'],
          ['Xã Sơn Nham', '21292'],
          ['Xã Sơn Thành', '21292'],
          ['Xã Sơn Thủy', '21319'],
          ['Xã Sơn Thượng', '21289'],
          ['Xã Sơn Trung', '21319']
        ]
      },
      {
        oldDistrict: 'Huyện Sơn Tây',
        wards: [
          ['Xã Sơn Bua', '21334'],
          ['Xã Sơn Dung', '21340'],
          ['Xã Sơn Lập', '21343'],
          ['Xã Sơn Liên', '21334'],
          ['Xã Sơn Long', '21340'],
          ['Xã Sơn Màu', '21343'],
          ['Xã Sơn Mùa', '21334'],
          ['Xã Sơn Tân', '21340'],
          ['Xã Sơn Tinh', '21343']
        ]
      },
      {
        oldDistrict: 'Huyện Sơn Tịnh',
        wards: [
          ['Thị trấn Tịnh Hà', '21220'],
          ['Xã Tịnh Bắc', '21205'],
          ['Xã Tịnh Bình', '21220'],
          ['Xã Tịnh Đông', '21196'],
          ['Xã Tịnh Giang', '21196'],
          ['Xã Tịnh Hiệp', '21205'],
          ['Xã Tịnh Minh', '21196'],
          ['Xã Tịnh Phong', '21181'],
          ['Xã Tịnh Sơn', '21220'],
          ['Xã Tịnh Thọ', '21181'],
          ['Xã Tịnh Trà', '21205']
        ]
      },
      {
        oldDistrict: 'Huyện Trà Bồng',
        wards: [
          ['Thị trấn Trà Xuân', '21115'],
          ['Xã Hương Trà', '21157'],
          ['Xã Sơn Trà', '21154'],
          ['Xã Trà Bình', '21127'],
          ['Xã Trà Bùi', '21136'],
          ['Xã Trà Giang', '21127'],
          ['Xã Trà Hiệp', '21124'],
          ['Xã Trà Lâm', '21124'],
          ['Xã Trà Phong', '21154'],
          ['Xã Trà Phú', '21127'],
          ['Xã Trà Sơn', '21115'],
          ['Xã Trà Tân', '21136'],
          ['Xã Trà Tây', '21157'],
          ['Xã Trà Thanh', '21124'],
          ['Xã Trà Thủy', '21115'],
          ['Xã Trà Xinh', '21154']
        ]
      },
      {
        oldDistrict: 'Huyện Tư Nghĩa',
        wards: [
          ['Thị trấn La Hà', '21235'],
          ['Thị trấn Sông Vệ', '21238'],
          ['Xã Nghĩa Điền', '21250'],
          ['Xã Nghĩa Hiệp', '21238'],
          ['Xã Nghĩa Hòa', '21235'],
          ['Xã Nghĩa Kỳ', '21250'],
          ['Xã Nghĩa Lâm', '21244'],
          ['Xã Nghĩa Phương', '21238'],
          ['Xã Nghĩa Sơn', '21244'],
          ['Xã Nghĩa Thắng', '21244'],
          ['Xã Nghĩa Thuận', '21250'],
          ['Xã Nghĩa Thương', '21235'],
          ['Xã Nghĩa Trung', '21235']
        ]
      },
      {
        oldDistrict: 'Thành phố Quảng Ngãi',
        wards: [
          ['Phường Chánh Lộ', '21025'],
          ['Phường Lê Hồng Phong', '21028'],
          ['Phường Nghĩa Chánh', '21025'],
          ['Phường Nghĩa Lộ', '21028'],
          ['Phường Nguyễn Nghiêm', '21025'],
          ['Phường Quảng Phú', '21028'],
          ['Phường Trần Hưng Đạo', '21025'],
          ['Phường Trần Phú', '21028'],
          ['Phường Trương Quang Trọng', '21172'],
          ['Xã An Phú', '21034'],
          ['Xã Nghĩa Dõng', '21034'],
          ['Xã Nghĩa Dũng', '21034'],
          ['Xã Nghĩa Hà', '21034'],
          ['Xã Tịnh An', '21172'],
          ['Xã Tịnh Ấn Đông', '21172'],
          ['Xã Tịnh Ấn Tây', '21172'],
          ['Xã Tịnh Châu', '21211'],
          ['Xã Tịnh Hòa', '21109'],
          ['Xã Tịnh Khê', '21211'],
          ['Xã Tịnh Kỳ', '21211'],
          ['Xã Tịnh Long', '21211'],
          ['Xã Tịnh Thiện', '21211']
        ]
      },
      {
        oldDistrict: 'Thị xã Đức Phổ',
        wards: [
          ['Phường Nguyễn Nghiêm', '21439'],
          ['Phường Phổ Hòa', '21439'],
          ['Phường Phổ Minh', '21439'],
          ['Phường Phổ Ninh', '21439'],
          ['Phường Phổ Quang', '21451'],
          ['Phường Phổ Thạnh', '21478'],
          ['Phường Phổ Văn', '21451'],
          ['Phường Phổ Vinh', '21439'],
          ['Xã Phổ An', '21451'],
          ['Xã Phổ Châu', '21478'],
          ['Xã Phổ Cường', '21472'],
          ['Xã Phổ Khánh', '21472'],
          ['Xã Phổ Nhơn', '21457'],
          ['Xã Phổ Phong', '21457'],
          ['Xã Phổ Thuận', '21451']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Quảng Ninh',
    districts: [
      {
        oldDistrict: 'Huyện Ba Chẽ',
        wards: [
          ['Thị trấn Ba Chẽ', '06970'],
          ['Xã Đạp Thanh', '06979'],
          ['Xã Đồn Đạc', '06970'],
          ['Xã Lương Minh', '06985'],
          ['Xã Nam Sơn', '06970'],
          ['Xã Thanh Lâm', '06979'],
          ['Xã Thanh Sơn', '06970']
        ]
      },
      {
        oldDistrict: 'Huyện Bình Liêu',
        wards: [
          ['Thị trấn Bình Liêu', '06838'],
          ['Xã Đồng Tâm', '06856'],
          ['Xã Đồng Văn', '06841'],
          ['Xã Hoành Mô', '06841'],
          ['Xã Húc Động', '06838'],
          ['Xã Lục Hồn', '06856'],
          ['Xã Vô Ngại', '06838']
        ]
      },
      {
        oldDistrict: 'Huyện Cô Tô',
        wards: [
          ['Thị trấn Cô Tô', '07192'],
          ['Xã Đồng Tiến', '07192'],
          ['Xã Thanh Lân', '07192']
        ]
      },
      {
        oldDistrict: 'Huyện Đầm Hà',
        wards: [
          ['Thị trấn Đầm Hà', '06895'],
          ['Xã Dực Yên', '06913'],
          ['Xã Đại Bình', '06895'],
          ['Xã Đầm Hà', '06895'],
          ['Xã Quảng An', '06913'],
          ['Xã Quảng Lâm', '06913'],
          ['Xã Quảng Tân', '06913'],
          ['Xã Tân Bình', '06895'],
          ['Xã Tân Lập', '06895']
        ]
      },
      {
        oldDistrict: 'Huyện Hải Hà',
        wards: [
          ['Thị trấn Quảng Hà', '06922'],
          ['Xã Cái Chiên', '06967'],
          ['Xã Đường Hoa', '06946'],
          ['Xã Quảng Chính', '06922'],
          ['Xã Quảng Đức', '06931'],
          ['Xã Quảng Long', '06946'],
          ['Xã Quảng Minh', '06922'],
          ['Xã Quảng Phong', '06922'],
          ['Xã Quảng Sơn', '06946'],
          ['Xã Quảng Thành', '06931'],
          ['Xã Quảng Thịnh', '06931']
        ]
      },
      {
        oldDistrict: 'Huyện Tiên Yên',
        wards: [
          ['Thị trấn Tiên Yên', '06862'],
          ['Xã Đại Dực', '06877'],
          ['Xã Điền Xá', '06874'],
          ['Xã Đông Hải', '06877'],
          ['Xã Đông Ngũ', '06877'],
          ['Xã Đồng Rui', '06886'],
          ['Xã Hà Lâu', '06874'],
          ['Xã Hải Lạng', '06886'],
          ['Xã Phong Dụ', '06862'],
          ['Xã Tiên Lãng', '06862'],
          ['Xã Yên Than', '06874']
        ]
      },
      {
        oldDistrict: 'Huyện Vân Đồn',
        wards: [
          ['Thị trấn Cái Rồng', '06994'],
          ['Xã Bản Sen', '06994'],
          ['Xã Bình Dân', '06994'],
          ['Xã Đài Xuyên', '06994'],
          ['Xã Đoàn Kết', '06994'],
          ['Xã Đông Xá', '06994'],
          ['Xã Hạ Long', '06994'],
          ['Xã Minh Châu', '06994'],
          ['Xã Ngọc Vừng', '06994'],
          ['Xã Quan Lạn', '06994'],
          ['Xã Thắng Lợi', '06994'],
          ['Xã Vạn Yên', '06994']
        ]
      },
      {
        oldDistrict: 'Thành phố Cẩm Phả',
        wards: [
          ['Phường Cẩm Bình', '06793'],
          ['Phường Cẩm Đông', '06793'],
          ['Phường Cẩm Phú', '06781'],
          ['Phường Cẩm Sơn', '06781'],
          ['Phường Cẩm Tây', '06793'],
          ['Phường Cẩm Thạch', '06778'],
          ['Phường Cẩm Thành', '06793'],
          ['Phường Cẩm Thịnh', '06781'],
          ['Phường Cẩm Thủy', '06778'],
          ['Phường Cẩm Trung', '06793'],
          ['Phường Cửa Ông', '06781'],
          ['Phường Mông Dương', '06760'],
          ['Phường Quang Hanh', '06778'],
          ['Xã Dương Huy', '06760'],
          ['Xã Hải Hòa', '06799']
        ]
      },
      {
        oldDistrict: 'Thành phố Đông Triều',
        wards: [
          ['Phường Bình Dương', '07090'],
          ['Phường Bình Khê', '07081'],
          ['Phường Đức Chính', '07093'],
          ['Phường Hoàng Quế', '07114'],
          ['Phường Hồng Phong', '07093'],
          ['Phường Hưng Đạo', '07093'],
          ['Phường Kim Sơn', '07069'],
          ['Phường Mạo Khê', '07069'],
          ['Phường Thủy An', '07093'],
          ['Phường Tràng An', '07081'],
          ['Phường Xuân Sơn', '07069'],
          ['Phường Yên Đức', '07114'],
          ['Phường Yên Thọ', '07069'],
          ['Xã An Sinh', '07090'],
          ['Xã Hồng Thái Đông', '07114'],
          ['Xã Hồng Thái Tây', '07114'],
          ['Xã Nguyễn Huệ', '07093'],
          ['Xã Tràng Lương', '07081'],
          ['Xã Việt Dân', '07090']
        ]
      },
      {
        oldDistrict: 'Thành phố Hạ Long',
        wards: [
          ['Phường Bạch Đằng', '06685'],
          ['Phường Bãi Cháy', '06673'],
          ['Phường Cao Thắng', '06676'],
          ['Phường Cao Xanh', '06658'],
          ['Phường Đại Yên', '06706'],
          ['Phường Giếng Đáy', '06661'],
          ['Phường Hà Khánh', '06658'],
          ['Phường Hà Khẩu', '06661'],
          ['Phường Hà Lầm', '06676'],
          ['Phường Hà Phong', '06652'],
          ['Phường Hà Trung', '06676'],
          ['Phường Hà Tu', '06652'],
          ['Phường Hoành Bồ', '07030'],
          ['Phường Hồng Gai', '06685'],
          ['Phường Hồng Hà', '06688'],
          ['Phường Hồng Hải', '06688'],
          ['Phường Hùng Thắng', '06673'],
          ['Phường Trần Hưng Đạo', '06685'],
          ['Phường Tuần Châu', '06706'],
          ['Phường Việt Hưng', '06661'],
          ['Xã Bằng Cả', '07054'],
          ['Xã Dân Chủ', '07054'],
          ['Xã Đồng Lâm', '07060'],
          ['Xã Đồng Sơn', '06985'],
          ['Xã Hòa Bình', '07060'],
          ['Xã Kỳ Thượng', '06979'],
          ['Xã Lê Lợi', '07030'],
          ['Xã Quảng La', '07054'],
          ['Xã Sơn Dương', '07030'],
          ['Xã Tân Dân', '07054'],
          ['Xã Thống Nhất', '07060'],
          ['Xã Vũ Oai', '07060']
        ]
      },
      {
        oldDistrict: 'Thành phố Móng Cái',
        wards: [
          ['Phường Bình Ngọc', '06712'],
          ['Phường Hải Hoà', '06712'],
          ['Phường Hải Yên', '06736'],
          ['Phường Ka Long', '06709'],
          ['Phường Ninh Dương', '06709'],
          ['Phường Trà Cổ', '06712'],
          ['Phường Trần Phú', '06712'],
          ['Xã Bắc Sơn', '06724'],
          ['Xã Hải Đông', '06736'],
          ['Xã Hải Sơn', '06724'],
          ['Xã Hải Tiến', '06733'],
          ['Xã Hải Xuân', '06712'],
          ['Xã Quảng Nghĩa', '06733'],
          ['Xã Vạn Ninh', '06709'],
          ['Xã Vĩnh Thực', '06757'],
          ['Xã Vĩnh Trung', '06757']
        ]
      },
      {
        oldDistrict: 'Thành phố Uông Bí',
        wards: [
          ['Phường Bắc Sơn', '06820'],
          ['Phường Nam Khê', '06820'],
          ['Phường Phương Đông', '06832'],
          ['Phường Phương Nam', '06832'],
          ['Phường Quang Trung', '06811'],
          ['Phường Thanh Sơn', '06811'],
          ['Phường Trưng Vương', '06820'],
          ['Phường Vàng Danh', '06820'],
          ['Phường Yên Thanh', '06811'],
          ['Xã Thượng Yên Công', '06832']
        ]
      },
      {
        oldDistrict: 'Thị xã Quảng Yên',
        wards: [
          ['Phường Cộng Hòa', '07147'],
          ['Phường Đông Mai', '07135'],
          ['Phường Hà An', '07168'],
          ['Phường Minh Thành', '07135'],
          ['Phường Nam Hoà', '07183'],
          ['Phường Phong Cốc', '07183'],
          ['Phường Phong Hải', '07180'],
          ['Phường Quảng Yên', '07132'],
          ['Phường Tân An', '07168'],
          ['Phường Yên Giang', '07132'],
          ['Phường Yên Hải', '07183'],
          ['Xã Cẩm La', '07183'],
          ['Xã Hiệp Hòa', '07147'],
          ['Xã Hoàng Tân', '07168'],
          ['Xã Liên Hòa', '07180'],
          ['Xã Liên Vị', '07180'],
          ['Xã Sông Khoai', '07147'],
          ['Xã Tiền An', '07132'],
          ['Xã Tiền Phong', '07180']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Quảng Trị',
    districts: [
      {
        oldDistrict: 'Huyện Cam Lộ',
        wards: [
          ['Thị trấn Cam Lộ', '19597'],
          ['Xã Cam Chính', '19597'],
          ['Xã Cam Hiếu', '19603'],
          ['Xã Cam Nghĩa', '19597'],
          ['Xã Cam Thành', '19597'],
          ['Xã Cam Thủy', '19603'],
          ['Xã Cam Tuyền', '19603'],
          ['Xã Thanh An', '19603']
        ]
      },
      {
        oldDistrict: 'Huyện Cồn Cỏ',
        wards: [['Huyện đảo Cồn Cỏ (không chia phường/xã)', '19742']]
      },
      {
        oldDistrict: 'Huyện Đa Krông',
        wards: [
          ['Thị trấn Krông Klang', '19555'],
          ['Xã A Bung', '19594'],
          ['Xã A Ngo', '19594'],
          ['Xã A Vao', '19588'],
          ['Xã Ba Lòng', '19567'],
          ['Xã Ba Nang', '19564'],
          ['Xã Đa Krông', '19564'],
          ['Xã Húc Nghì', '19588'],
          ['Xã Hướng Hiệp', '19555'],
          ['Xã Mò Ó', '19555'],
          ['Xã Tà Long', '19564'],
          ['Xã Tà Rụt', '19588'],
          ['Xã Triệu Nguyên', '19567']
        ]
      },
      {
        oldDistrict: 'Huyện Gio Linh',
        wards: [
          ['Thị trấn Cửa Việt', '19496'],
          ['Thị trấn Gio Linh', '19495'],
          ['Xã Gio An', '19537'],
          ['Xã Gio Hải', '19496'],
          ['Xã Gio Mai', '19496'],
          ['Xã Gio Mỹ', '19495'],
          ['Xã Gio Quang', '19495'],
          ['Xã Gio Sơn', '19537'],
          ['Xã Hải Thái', '19537'],
          ['Xã Linh Trường', '19537'],
          ['Xã Phong Bình', '19495'],
          ['Xã Trung Giang', '19501'],
          ['Xã Trung Hải', '19501'],
          ['Xã Trung Sơn', '19501']
        ]
      },
      {
        oldDistrict: 'Huyện Hải Lăng',
        wards: [
          ['Thị trấn Diên Sanh', '19681'],
          ['Xã Hải An', '19741'],
          ['Xã Hải Bình', '19699'],
          ['Xã Hải Chánh', '19735'],
          ['Xã Hải Dương', '19741'],
          ['Xã Hải Định', '19681'],
          ['Xã Hải Hưng', '19699'],
          ['Xã Hải Khê', '19741'],
          ['Xã Hải Lâm', '19702'],
          ['Xã Hải Phong', '19735'],
          ['Xã Hải Phú', '19702'],
          ['Xã Hải Quy', '19699'],
          ['Xã Hải Sơn', '19735'],
          ['Xã Hải Thượng', '19702'],
          ['Xã Hải Trường', '19681']
        ]
      },
      {
        oldDistrict: 'Huyện Hướng Hóa',
        wards: [
          ['Thị trấn Khe Sanh', '19429'],
          ['Thị trấn Lao Bảo', '19432'],
          ['Xã A Dơi', '19483'],
          ['Xã Ba Tầng', '19483'],
          ['Xã Húc', '19429'],
          ['Xã Hướng Lập', '19435'],
          ['Xã Hướng Linh', '19441'],
          ['Xã Hướng Lộc', '19462'],
          ['Xã Hướng Phùng', '19441'],
          ['Xã Hướng Sơn', '19441'],
          ['Xã Hướng Tân', '19429'],
          ['Xã Hướng Việt', '19435'],
          ['Xã Lìa', '19489'],
          ['Xã Tân Hợp', '19429'],
          ['Xã Tân Lập', '19462'],
          ['Xã Tân Liên', '19462'],
          ['Xã Tân Long', '19432'],
          ['Xã Tân Thành', '19432'],
          ['Xã Thanh', '19489'],
          ['Xã Thuận', '19489'],
          ['Xã Xy', '19483']
        ]
      },
      {
        oldDistrict: 'Huyện Triệu Phong',
        wards: [
          ['Thị trấn Ái Tử', '19624'],
          ['Xã Triệu Ái', '19669'],
          ['Xã Triệu Cơ', '19654'],
          ['Xã Triệu Đại', '19645'],
          ['Xã Triệu Độ', '19645'],
          ['Xã Triệu Giang', '19669'],
          ['Xã Triệu Hòa', '19645'],
          ['Xã Triệu Long', '19669'],
          ['Xã Triệu Phước', '19639'],
          ['Xã Triệu Tài', '19654'],
          ['Xã Triệu Tân', '19639'],
          ['Xã Triệu Thành', '19624'],
          ['Xã Triệu Thuận', '19645'],
          ['Xã Triệu Thượng', '19624'],
          ['Xã Triệu Trạch', '19639'],
          ['Xã Triệu Trung', '19654']
        ]
      },
      {
        oldDistrict: 'Huyện Vĩnh Linh',
        wards: [
          ['Thị trấn Bến Quan', '19366'],
          ['Thị trấn Cửa Tùng', '19414'],
          ['Thị trấn Hồ Xá', '19363'],
          ['Xã Hiền Thành', '19414'],
          ['Xã Kim Thạch', '19414'],
          ['Xã Trung Nam', '19372'],
          ['Xã Vĩnh Chấp', '19363'],
          ['Xã Vĩnh Giang', '19414'],
          ['Xã Vĩnh Hà', '19366'],
          ['Xã Vĩnh Hòa', '19372'],
          ['Xã Vĩnh Khê', '19366'],
          ['Xã Vĩnh Lâm', '19405'],
          ['Xã Vĩnh Long', '19363'],
          ['Xã Vĩnh Ô', '19366'],
          ['Xã Vĩnh Sơn', '19405'],
          ['Xã Vĩnh Thái', '19372'],
          ['Xã Vĩnh Thủy', '19405'],
          ['Xã Vĩnh Tú', '19372']
        ]
      },
      {
        oldDistrict: 'Thành phố Đông Hà',
        wards: [
          ['Phường 1', '19333'],
          ['Phường 2', '19351'],
          ['Phường 3', '19333'],
          ['Phường 4', '19333'],
          ['Phường 5', '19351'],
          ['Phường Đông Giang', '19333'],
          ['Phường Đông Lễ', '19351'],
          ['Phường Đông Lương', '19351'],
          ['Phường Đông Thanh', '19333']
        ]
      },
      {
        oldDistrict: 'Thị xã Quảng Trị',
        wards: [
          ['Phường 1', '19360'],
          ['Phường 2', '19360'],
          ['Phường 3', '19360'],
          ['Phường An Đôn', '19360'],
          ['Xã Hải Lệ', '19360']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Sóc Trăng',
    districts: [
      {
        oldDistrict: 'Huyện Châu Thành',
        wards: [
          ['Thị trấn Châu Thành', '31569'],
          ['Xã An Hiệp', '31594'],
          ['Xã An Ninh', '31594'],
          ['Xã Hồ Đắc Kiện', '31570'],
          ['Xã Phú Tâm', '31569'],
          ['Xã Phú Tân', '31582'],
          ['Xã Thiện Mỹ', '31570'],
          ['Xã Thuận Hòa', '31582']
        ]
      },
      {
        oldDistrict: 'Huyện Cù Lao Dung',
        wards: [
          ['Thị trấn Cù Lao Dung', '31615'],
          ['Xã An Thạnh 1', '31615'],
          ['Xã An Thạnh 2', '31633'],
          ['Xã An Thạnh 3', '31633'],
          ['Xã An Thạnh Đông', '31615'],
          ['Xã An Thạnh Nam', '31633'],
          ['Xã An Thạnh Tây', '31615'],
          ['Xã Đại Ân 1', '31633']
        ]
      },
      {
        oldDistrict: 'Huyện Kế Sách',
        wards: [
          ['Thị trấn An Lạc Thôn', '31531'],
          ['Thị trấn Kế Sách', '31528'],
          ['Xã An Lạc Tây', '31540'],
          ['Xã An Mỹ', '31552'],
          ['Xã Ba Trinh', '31561'],
          ['Xã Đại Hải', '31561'],
          ['Xã Kế An', '31528'],
          ['Xã Kế Thành', '31528'],
          ['Xã Nhơn Mỹ', '31552'],
          ['Xã Phong Nẫm', '31537'],
          ['Xã Thới An Hội', '31540'],
          ['Xã Trinh Phú', '31531'],
          ['Xã Xuân Hòa', '31531']
        ]
      },
      {
        oldDistrict: 'Huyện Long Phú',
        wards: [
          ['Thị trấn Đại Ngãi', '31645'],
          ['Thị trấn Long Phú', '31639'],
          ['Xã Châu Khánh', '31666'],
          ['Xã Hậu Thạnh', '31654'],
          ['Xã Long Đức', '31645'],
          ['Xã Long Phú', '31639'],
          ['Xã Phú Hữu', '31654'],
          ['Xã Song Phụng', '31552'],
          ['Xã Tân Hưng', '31666'],
          ['Xã Tân Thạnh', '31666'],
          ['Xã Trường Khánh', '31654']
        ]
      },
      {
        oldDistrict: 'Huyện Mỹ Tú',
        wards: [
          ['Thị trấn Huỳnh Hữu Nghĩa', '31567'],
          ['Xã Hưng Phú', '31579'],
          ['Xã Long Hưng', '31579'],
          ['Xã Mỹ Hương', '31591'],
          ['Xã Mỹ Phước', '31603'],
          ['Xã Mỹ Thuận', '31567'],
          ['Xã Mỹ Tú', '31567'],
          ['Xã Phú Mỹ', '31591'],
          ['Xã Thuận Hưng', '31591']
        ]
      },
      {
        oldDistrict: 'Huyện Mỹ Xuyên',
        wards: [
          ['Thị trấn Mỹ Xuyên', '31684'],
          ['Xã Đại Tâm', '31684'],
          ['Xã Gia Hòa 1', '31708'],
          ['Xã Gia Hòa 2', '31726'],
          ['Xã Hòa Tú 1', '31717'],
          ['Xã Hòa Tú II', '31717'],
          ['Xã Ngọc Đông', '31723'],
          ['Xã Ngọc Tố', '31723'],
          ['Xã Tham Đôn', '31723'],
          ['Xã Thạnh Phú', '31708'],
          ['Xã Thạnh Quới', '31726']
        ]
      },
      {
        oldDistrict: 'Huyện Thạnh Trị',
        wards: [
          ['Thị trấn Hưng Lợi', '31756'],
          ['Thị trấn Phú Lộc', '31756'],
          ['Xã Châu Hưng', '31777'],
          ['Xã Lâm Kiết', '31759'],
          ['Xã Lâm Tân', '31759'],
          ['Xã Thạnh Tân', '31741'],
          ['Xã Thạnh Trị', '31756'],
          ['Xã Tuân Tức', '31759'],
          ['Xã Vĩnh Lợi', '31777'],
          ['Xã Vĩnh Thành', '31777']
        ]
      },
      {
        oldDistrict: 'Huyện Trần Đề',
        wards: [
          ['Thị trấn Lịch Hội Thượng', '31679'],
          ['Thị trấn Trần Đề', '31673'],
          ['Xã Đại Ân 2', '31673'],
          ['Xã Lịch Hội Thượng', '31679'],
          ['Xã Liêu Tú', '31675'],
          ['Xã Tài Văn', '31687'],
          ['Xã Thạnh Thới An', '31699'],
          ['Xã Thạnh Thới Thuận', '31699'],
          ['Xã Trung Bình', '31673'],
          ['Xã Viên An', '31687'],
          ['Xã Viên Bình', '31675']
        ]
      },
      {
        oldDistrict: 'Thành phố Sóc Trăng',
        wards: [
          ['Phường 1', '31510'],
          ['Phường 2', '31510'],
          ['Phường 3', '31510'],
          ['Phường 4', '31510'],
          ['Phường 5', '31507'],
          ['Phường 6', '31507'],
          ['Phường 7', '31507'],
          ['Phường 8', '31507'],
          ['Phường 10', '31684']
        ]
      },
      {
        oldDistrict: 'Thị xã Ngã Năm',
        wards: [
          ['Phường 1', '31732'],
          ['Phường 2', '31732'],
          ['Phường 3', '31753'],
          ['Xã Long Bình', '31741'],
          ['Xã Mỹ Bình', '31753'],
          ['Xã Mỹ Quới', '31753'],
          ['Xã Tân Long', '31741'],
          ['Xã Vĩnh Quới', '31732']
        ]
      },
      {
        oldDistrict: 'Thị xã Vĩnh Châu',
        wards: [
          ['Phường 1', '31783'],
          ['Phường 2', '31783'],
          ['Phường Khánh Hòa', '31789'],
          ['Phường Vĩnh Phước', '31804'],
          ['Xã Hòa Đông', '31789'],
          ['Xã Lạc Hòa', '31783'],
          ['Xã Lai Hòa', '31810'],
          ['Xã Vĩnh Hải', '31795'],
          ['Xã Vĩnh Hiệp', '31789'],
          ['Xã Vĩnh Tân', '31804']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Sơn La',
    districts: [
      {
        oldDistrict: 'Huyện Bắc Yên',
        wards: [
          ['Thị trấn Bắc Yên', '03856'],
          ['Xã Chiềng Sại', '03892'],
          ['Xã Chim Vàn', '03871'],
          ['Xã Hang Chú', '03862'],
          ['Xã Háng Đồng', '03868'],
          ['Xã Hồng Ngài', '03856'],
          ['Xã Hua Nhàn', '03880'],
          ['Xã Làng Chếu', '03868'],
          ['Xã Mường Khoa', '03880'],
          ['Xã Pắc Ngà', '03871'],
          ['Xã Phiêng Ban', '03856'],
          ['Xã Phiêng Côn', '03892'],
          ['Xã Song Pe', '03856'],
          ['Xã Tạ Khoa', '03880'],
          ['Xã Tà Xùa', '03868'],
          ['Xã Xím Vàng', '03862']
        ]
      },
      {
        oldDistrict: 'Huyện Mai Sơn',
        wards: [
          ['Thị trấn Hát Lót', '04105'],
          ['Xã Chiềng Ban', '04132'],
          ['Xã Chiềng Chăn', '04108'],
          ['Xã Chiềng Chung', '04117'],
          ['Xã Chiềng Dong', '04132'],
          ['Xã Chiềng Kheo', '04132'],
          ['Xã Chiềng Lương', '04159'],
          ['Xã Chiềng Mai', '04132'],
          ['Xã Chiềng Mung', '04123'],
          ['Xã Chiềng Nơi', '04144'],
          ['Xã Chiềng Sung', '04108'],
          ['Xã Chiềng Ve', '04132'],
          ['Xã Cò Nòi', '04105'],
          ['Xã Hát Lót', '04105'],
          ['Xã Mường Bằng', '04123'],
          ['Xã Mường Bon', '04123'],
          ['Xã Mường Chanh', '04117'],
          ['Xã Nà Bó', '04136'],
          ['Xã Nà Ơt', '04159'],
          ['Xã Phiêng Cằm', '04144'],
          ['Xã Phiêng Pằn', '04159'],
          ['Xã Tà Hộc', '04136']
        ]
      },
      {
        oldDistrict: 'Huyện Mường La',
        wards: [
          ['Thị trấn Ít Ong', '03808'],
          ['Xã Chiềng Ân', '03850'],
          ['Xã Chiềng Công', '03850'],
          ['Xã Chiềng Hoa', '03850'],
          ['Xã Chiềng Lao', '03814'],
          ['Xã Chiềng Muôn', '03808'],
          ['Xã Chiềng San', '03808'],
          ['Xã Hua Trai', '03814'],
          ['Xã Mường Bú', '03847'],
          ['Xã Mường Chùm', '03847'],
          ['Xã Mường Trai', '03808'],
          ['Xã Nậm Giôn', '03814'],
          ['Xã Nậm Păm', '03808'],
          ['Xã Ngọc Chiến', '03820'],
          ['Xã Pi Toong', '03808'],
          ['Xã Tạ Bú', '03847']
        ]
      },
      {
        oldDistrict: 'Huyện Phù Yên',
        wards: [
          ['Thị trấn Quang Huy', '03910'],
          ['Xã Bắc Phong', '03970'],
          ['Xã Đá Đỏ', '03961'],
          ['Xã Gia Phù', '03922'],
          ['Xã Huy Hạ', '03910'],
          ['Xã Huy Tân', '03910'],
          ['Xã Huy Thượng', '03910'],
          ['Xã Huy Tường', '03910'],
          ['Xã Kim Bon', '03961'],
          ['Xã Mường Bang', '03943'],
          ['Xã Mường Cơi', '03907'],
          ['Xã Mường Do', '03943'],
          ['Xã Mường Lang', '03943'],
          ['Xã Mường Thải', '03907'],
          ['Xã Nam Phong', '03970'],
          ['Xã Sập Xa', '03922'],
          ['Xã Suối Bau', '03922'],
          ['Xã Suối Tọ', '03901'],
          ['Xã Tân Lang', '03907'],
          ['Xã Tân Phong', '03970'],
          ['Xã Tường Hạ', '03958'],
          ['Xã Tường Phong', '03958'],
          ['Xã Tường Phù', '03922'],
          ['Xã Tường Thượng', '03958'],
          ['Xã Tường Tiến', '03958']
        ]
      },
      {
        oldDistrict: 'Huyện Quỳnh Nhai',
        wards: [
          ['Thị trấn Mường Giàng', '03703'],
          ['Xã Cà Nàng', '03688'],
          ['Xã Chiềng Bằng', '03703'],
          ['Xã Chiềng Khay', '03688'],
          ['Xã Chiềng Khoang', '03703'],
          ['Xã Chiềng Ơn', '03703'],
          ['Xã Mường Chiên', '03688'],
          ['Xã Mường Giôn', '03694'],
          ['Xã Mường Sại', '03712'],
          ['Xã Nậm ét', '03712'],
          ['Xã Pá Ma Pha Khinh', '03694']
        ]
      },
      {
        oldDistrict: 'Huyện Sông Mã',
        wards: [
          ['Thị trấn Sông Mã', '04168'],
          ['Xã Bó Sinh', '04171'],
          ['Xã Chiềng Cang', '04219'],
          ['Xã Chiềng En', '04171'],
          ['Xã Chiềng Khoong', '04204'],
          ['Xã Chiềng Khương', '04222'],
          ['Xã Chiềng Phung', '04186'],
          ['Xã Chiềng Sơ', '04195'],
          ['Xã Đứa Mòn', '04183'],
          ['Xã Huổi Một', '04210'],
          ['Xã Mường Cai', '04204'],
          ['Xã Mường Hung', '04219'],
          ['Xã Mường Lầm', '04183'],
          ['Xã Mường Sai', '04222'],
          ['Xã Nà Nghịu', '04168'],
          ['Xã Nậm Mằn', '04210'],
          ['Xã Nậm Ty', '04186'],
          ['Xã Pú Pẩu', '04171'],
          ['Xã Yên Hưng', '04195']
        ]
      },
      {
        oldDistrict: 'Huyện Sốp Cộp',
        wards: [
          ['Xã Dồm Cang', '04228'],
          ['Xã Mường Lạn', '04246'],
          ['Xã Mường Lèo', '04240'],
          ['Xã Mường Và', '04231'],
          ['Xã Nậm Lạnh', '04231'],
          ['Xã Púng Bánh', '04228'],
          ['Xã Sam Kha', '04228'],
          ['Xã Sốp Cộp', '04231']
        ]
      },
      {
        oldDistrict: 'Huyện Thuận Châu',
        wards: [
          ['Thị trấn Thuận Châu', '03721'],
          ['Xã Bản Lầm', '03799'],
          ['Xã Bó Mười', '03757'],
          ['Xã Bon Phặng', '03799'],
          ['Xã Chiềng Bôm', '03784'],
          ['Xã Chiềng La', '03754'],
          ['Xã Chiềng Ngàm', '03754'],
          ['Xã Chiềng Pấc', '03721'],
          ['Xã Chiềng Pha', '03724'],
          ['Xã Co Mạ', '03781'],
          ['Xã Co Tòng', '03781'],
          ['Xã é Tòng', '03763'],
          ['Xã Liệp Tè', '03757'],
          ['Xã Long Hẹ', '03763'],
          ['Xã Muổi Nọi', '03799'],
          ['Xã Mường Bám', '03760'],
          ['Xã Mường é', '03727'],
          ['Xã Mường Khiêng', '03757'],
          ['Xã Nậm Lầu', '03784'],
          ['Xã Noong Lay', '03754'],
          ['Xã Pá Lông', '03781'],
          ['Xã Phổng Lái', '03724'],
          ['Xã Phổng Lập', '03727'],
          ['Xã Phổng Ly', '03721'],
          ['Xã Púng Tra', '03784'],
          ['Xã Thôm Mòn', '03721'],
          ['Xã Tông Cọ', '03754'],
          ['Xã Tông Lạnh', '03721']
        ]
      },
      {
        oldDistrict: 'Huyện Vân Hồ',
        wards: [
          ['Xã Chiềng Khoa', '04018'],
          ['Xã Chiềng Xuân', '03985'],
          ['Xã Chiềng Yên', '04048'],
          ['Xã Liên Hoà', '04006'],
          ['Xã Lóng Luông', '04048'],
          ['Xã Mường Men', '04048'],
          ['Xã Mường Tè', '04006'],
          ['Xã Quang Minh', '04006'],
          ['Xã Song Khủa', '04006'],
          ['Xã Suối Bàng', '04018'],
          ['Xã Tân Xuân', '04057'],
          ['Xã Tô Múa', '04018'],
          ['Xã Vân Hồ', '04048'],
          ['Xã Xuân Nha', '04057']
        ]
      },
      {
        oldDistrict: 'Huyện Yên Châu',
        wards: [
          ['Thị trấn Yên Châu', '04075'],
          ['Xã Chiềng Đông', '04075'],
          ['Xã Chiềng Hặc', '04078'],
          ['Xã Chiềng Khoi', '04075'],
          ['Xã Chiềng On', '04087'],
          ['Xã Chiềng Pằn', '04075'],
          ['Xã Chiềng Sàng', '04075'],
          ['Xã Chiềng Tương', '04096'],
          ['Xã Lóng Phiêng', '04096'],
          ['Xã Mường Lựm', '04078'],
          ['Xã Phiêng Khoài', '04099'],
          ['Xã Sặp Vạt', '04075'],
          ['Xã Tú Nang', '04078'],
          ['Xã Yên Sơn', '04087']
        ]
      },
      {
        oldDistrict: 'Thành phố Sơn La',
        wards: [
          ['Phường Chiềng An', '03664'],
          ['Phường Chiềng Cơi', '03670'],
          ['Phường Chiềng Lề', '03646'],
          ['Phường Chiềng Sinh', '03679'],
          ['Phường Quyết Tâm', '03646'],
          ['Phường Quyết Thắng', '03646'],
          ['Phường Tô Hiệu', '03646'],
          ['Xã Chiềng Cọ', '03670'],
          ['Xã Chiềng Đen', '03664'],
          ['Xã Chiềng Ngần', '03679'],
          ['Xã Chiềng Xôm', '03664'],
          ['Xã Hua La', '03670']
        ]
      },
      {
        oldDistrict: 'Thị xã Mộc Châu',
        wards: [
          ['Phường Bình Minh', '04033'],
          ['Phường Cờ Đỏ', '03982'],
          ['Phường Đông Sang', '03979'],
          ['Phường Mộc Lỵ', '03980'],
          ['Phường Mộc Sơn', '03979'],
          ['Phường Mường Sang', '03980'],
          ['Phường Thảo Nguyên', '03982'],
          ['Phường Vân Sơn', '04033'],
          ['Xã Chiềng Chung', '04000'],
          ['Xã Chiềng Hắc', '03980'],
          ['Xã Chiềng Khừa', '04045'],
          ['Xã Chiềng Sơn', '03985'],
          ['Xã Đoàn Kết', '04000'],
          ['Xã Lóng Sập', '04045'],
          ['Xã Tân Yên', '03997']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Tây Ninh',
    districts: [
      {
        oldDistrict: 'Huyện Bến Cầu',
        wards: [
          ['Thị trấn Bến Cầu', '25681'],
          ['Xã An Thạnh', '25681'],
          ['Xã Long Chữ', '25684'],
          ['Xã Long Giang', '25702'],
          ['Xã Long Khánh', '25702'],
          ['Xã Long Phước', '25684'],
          ['Xã Long Thuận', '25702'],
          ['Xã Lợi Thuận', '25681'],
          ['Xã Tiên Thuận', '25681']
        ]
      },
      {
        oldDistrict: 'Huyện Châu Thành',
        wards: [
          ['Thị trấn Châu Thành', '25585'],
          ['Xã An Bình', '25585'],
          ['Xã An Cơ', '25588'],
          ['Xã Biên Giới', '25606'],
          ['Xã Đồng Khởi', '25585'],
          ['Xã Hảo Đước', '25588'],
          ['Xã Hòa Hội', '25606'],
          ['Xã Hòa Thạnh', '25606'],
          ['Xã Long Vĩnh', '25684'],
          ['Xã Ninh Điền', '25621'],
          ['Xã Phước Vinh', '25591'],
          ['Xã Thái Bình', '25585'],
          ['Xã Thanh Điền', '25633'],
          ['Xã Thành Long', '25621'],
          ['Xã Trí Bình', '25588']
        ]
      },
      {
        oldDistrict: 'Huyện Dương Minh Châu',
        wards: [
          ['Thị trấn Dương Minh Châu', '25552'],
          ['Xã Bàu Năng', '25567'],
          ['Xã Bến Củi', '25579'],
          ['Xã Cầu Khởi', '25573'],
          ['Xã Chà Là', '25567'],
          ['Xã Lộc Ninh', '25579'],
          ['Xã Phan', '25552'],
          ['Xã Phước Minh', '25579'],
          ['Xã Phước Ninh', '25573'],
          ['Xã Suối Đá', '25552'],
          ['Xã Truông Mít', '25666']
        ]
      },
      {
        oldDistrict: 'Huyện Gò Dầu',
        wards: [
          ['Thị trấn Gò Dầu', '25654'],
          ['Xã Bàu Đồn', '25666'],
          ['Xã Cẩm Giang', '25657'],
          ['Xã Hiệp Thạnh', '25663'],
          ['Xã Phước Đông', '25672'],
          ['Xã Phước Thạnh', '25663'],
          ['Xã Phước Trạch', '25663'],
          ['Xã Thạnh Đức', '25657'],
          ['Xã Thanh Phước', '25654']
        ]
      },
      {
        oldDistrict: 'Huyện Tân Biên',
        wards: [
          ['Thị trấn Tân Biên', '25486'],
          ['Xã Hòa Hiệp', '25591'],
          ['Xã Mỏ Công', '25510'],
          ['Xã Tân Bình', '25486'],
          ['Xã Tân Lập', '25489'],
          ['Xã Tân Phong', '25498'],
          ['Xã Thạnh Bắc', '25489'],
          ['Xã Thạnh Bình', '25498'],
          ['Xã Thạnh Tây', '25486'],
          ['Xã Trà Vong', '25510']
        ]
      },
      {
        oldDistrict: 'Huyện Tân Châu',
        wards: [
          ['Thị trấn Tân Châu', '25516'],
          ['Xã Suối Dây', '25534'],
          ['Xã Suối Ngô', '25531'],
          ['Xã Tân Đông', '25522'],
          ['Xã Tân Hà', '25522'],
          ['Xã Tân Hiệp', '25525'],
          ['Xã Tân Hòa', '25531'],
          ['Xã Tân Hội', '25525'],
          ['Xã Tân Hưng', '25549'],
          ['Xã Tân Phú', '25549'],
          ['Xã Tân Thành', '25534'],
          ['Xã Thạnh Đông', '25516']
        ]
      },
      {
        oldDistrict: 'Thành phố Tây Ninh',
        wards: [
          ['Phường 1', '25459'],
          ['Phường 2', '25459'],
          ['Phường 3', '25459'],
          ['Phường 4', '25459'],
          ['Phường Hiệp Ninh', '25459'],
          ['Phường Ninh Sơn', '25480'],
          ['Phường Ninh Thạnh', '25567'],
          ['Xã Bình Minh', '25480'],
          ['Xã Tân Bình', '25480'],
          ['Xã Thạnh Tân', '25480']
        ]
      },
      {
        oldDistrict: 'Thị xã Hòa Thành',
        wards: [
          ['Phường Hiệp Tân', '25633'],
          ['Phường Long Hoa', '25630'],
          ['Phường Long Thành Bắc', '25630'],
          ['Phường Long Thành Trung', '25645'],
          ['Xã Long Thành Nam', '25645'],
          ['Xã Trường Đông', '25630'],
          ['Xã Trường Hòa', '25630'],
          ['Xã Trường Tây', '25630']
        ]
      },
      {
        oldDistrict: 'Thị xã Trảng Bàng',
        wards: [
          ['Phường An Hòa', '25708'],
          ['Phường An Tịnh', '25732'],
          ['Phường Gia Bình', '25654'],
          ['Phường Gia Lộc', '25672'],
          ['Phường Lộc Hưng', '25732'],
          ['Phường Trảng Bàng', '25708'],
          ['Xã Đôn Thuận', '25711'],
          ['Xã Hưng Thuận', '25711'],
          ['Xã Phước Bình', '25729'],
          ['Xã Phước Chỉ', '25729']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Thái Bình',
    districts: [
      {
        oldDistrict: 'Huyện Đông Hưng',
        wards: [
          ['Thị trấn Đông Hưng', '12688'],
          ['Xã Đông Á', '12793'],
          ['Xã Đông Các', '12688'],
          ['Xã Đông Cường', '12694'],
          ['Xã Đông Dương', '12817'],
          ['Xã Đông Hoàng', '12775'],
          ['Xã Đông Hợp', '12688'],
          ['Xã Đông Kinh', '12745'],
          ['Xã Đông La', '12688'],
          ['Xã Đông Phương', '12694'],
          ['Xã Đông Quan', '12793'],
          ['Xã Đông Sơn', '12688'],
          ['Xã Đông Tân', '12793'],
          ['Xã Đông Vinh', '12745'],
          ['Xã Đông Xá', '12694'],
          ['Xã Hà Giang', '12745'],
          ['Xã Hồng Bạch', '12754'],
          ['Xã Hồng Giang', '12763'],
          ['Xã Hồng Việt', '12754'],
          ['Xã Liên An Đô', '12700'],
          ['Xã Liên Hoa', '12763'],
          ['Xã Lô Giang', '12700'],
          ['Xã Mê Linh', '12700'],
          ['Xã Minh Phú', '12763'],
          ['Xã Minh Tân', '12754'],
          ['Xã Nguyên Xá', '12688'],
          ['Xã Phong Dương Tiến', '12736'],
          ['Xã Phú Châu', '12736'],
          ['Xã Phú Lương', '12700'],
          ['Xã Thăng Long', '12754'],
          ['Xã Trọng Quan', '12763'],
          ['Xã Xuân Quang Động', '12775']
        ]
      },
      {
        oldDistrict: 'Huyện Hưng Hà',
        wards: [
          ['Thị trấn Hưng Hà', '12586'],
          ['Thị trấn Hưng Nhân', '12613'],
          ['Xã Bắc Sơn', '12631'],
          ['Xã Canh Tân', '12595'],
          ['Xã Chí Hòa', '12685'],
          ['Xã Chi Lăng', '12631'],
          ['Xã Cộng Hòa', '12595'],
          ['Xã Duyên Hải', '12619'],
          ['Xã Đoan Hùng', '12634'],
          ['Xã Độc Lập', '12676'],
          ['Xã Đông Đô', '12631'],
          ['Xã Hòa Bình', '12586'],
          ['Xã Hòa Tiến', '12595'],
          ['Xã Hồng An', '12676'],
          ['Xã Hồng Lĩnh', '12586'],
          ['Xã Hồng Minh', '12685'],
          ['Xã Kim Chung', '12586'],
          ['Xã Liên Hiệp', '12613'],
          ['Xã Minh Hòa', '12685'],
          ['Xã Minh Khai', '12586'],
          ['Xã Minh Tân', '12676'],
          ['Xã Phúc Khánh', '12634'],
          ['Xã Quang Trung', '12619'],
          ['Xã Tân Hòa', '12595'],
          ['Xã Tân Lễ', '12613'],
          ['Xã Tân Tiến', '12634'],
          ['Xã Tây Đô', '12631'],
          ['Xã Thái Hưng', '12613'],
          ['Xã Thái Phương', '12634'],
          ['Xã Thống Nhất', '12586'],
          ['Xã Tiến Đức', '12613'],
          ['Xã Văn Cẩm', '12619'],
          ['Xã Văn Lang', '12586']
        ]
      },
      {
        oldDistrict: 'Huyện Kiến Xương',
        wards: [
          ['Thị trấn Kiến Xương', '13075'],
          ['Xã An Bình', '13096'],
          ['Xã Bình Định', '13186'],
          ['Xã Bình Minh', '13075'],
          ['Xã Bình Nguyên', '13096'],
          ['Xã Bình Thanh', '13183'],
          ['Xã Hòa Bình', '13132'],
          ['Xã Hồng Thái', '13093'],
          ['Xã Hồng Tiến', '13186'],
          ['Xã Hồng Vũ', '13159'],
          ['Xã Lê Lợi', '13120'],
          ['Xã Minh Quang', '13183'],
          ['Xã Minh Tân', '13183'],
          ['Xã Nam Bình', '13186'],
          ['Xã Quang Bình', '13075'],
          ['Xã Quang Lịch', '13132'],
          ['Xã Quang Minh', '13075'],
          ['Xã Quang Trung', '13075'],
          ['Xã Quốc Tuấn', '13093'],
          ['Xã Tây Sơn', '12454'],
          ['Xã Thanh Tân', '13096'],
          ['Xã Thống Nhất', '13120'],
          ['Xã Trà Giang', '13093'],
          ['Xã Vũ An', '13141'],
          ['Xã Vũ Công', '13159'],
          ['Xã Vũ Lễ', '13132'],
          ['Xã Vũ Ninh', '13141'],
          ['Xã Vũ Quí', '13141'],
          ['Xã Vũ Trung', '13141']
        ]
      },
      {
        oldDistrict: 'Huyện Quỳnh Phụ',
        wards: [
          ['Thị trấn An Bài', '12523'],
          ['Thị trấn Quỳnh Côi', '12472'],
          ['Xã An Ấp', '12526'],
          ['Xã An Cầu', '12526'],
          ['Xã An Dục', '12583'],
          ['Xã An Đồng', '12499'],
          ['Xã An Hiệp', '12499'],
          ['Xã An Khê', '12499'],
          ['Xã An Lễ', '12526'],
          ['Xã An Mỹ', '12523'],
          ['Xã An Ninh', '12523'],
          ['Xã An Quí', '12526'],
          ['Xã An Thái', '12499'],
          ['Xã An Thanh', '12523'],
          ['Xã An Tràng', '12583'],
          ['Xã An Vinh', '12577'],
          ['Xã An Vũ', '12523'],
          ['Xã Châu Sơn', '12532'],
          ['Xã Đông Hải', '12577'],
          ['Xã Đồng Tiến', '12583'],
          ['Xã Quỳnh Giao', '12511'],
          ['Xã Quỳnh Hải', '12472'],
          ['Xã Quỳnh Hoa', '12511'],
          ['Xã Quỳnh Hoàng', '12517'],
          ['Xã Quỳnh Hội', '12472'],
          ['Xã Quỳnh Hồng', '12472'],
          ['Xã Quỳnh Hưng', '12472'],
          ['Xã Quỳnh Khê', '12532'],
          ['Xã Quỳnh Lâm', '12517'],
          ['Xã Quỳnh Minh', '12511'],
          ['Xã Quỳnh Mỹ', '12472'],
          ['Xã Quỳnh Ngọc', '12517'],
          ['Xã Quỳnh Nguyên', '12532'],
          ['Xã Quỳnh Thọ', '12511'],
          ['Xã Trang Bảo Xá', '12577']
        ]
      },
      {
        oldDistrict: 'Huyện Thái Thụy',
        wards: [
          ['Thị trấn Diêm Điền', '12826'],
          ['Xã An Tân', '12862'],
          ['Xã Dương Hồng Thủy', '12916'],
          ['Xã Dương Phúc', '12865'],
          ['Xã Hòa An', '12922'],
          ['Xã Hồng Dũng', '12862'],
          ['Xã Mỹ Lộc', '12943'],
          ['Xã Sơn Hà', '12919'],
          ['Xã Tân Học', '12943'],
          ['Xã Thái Đô', '12943'],
          ['Xã Thái Giang', '12919'],
          ['Xã Thái Hưng', '12922'],
          ['Xã Thái Nguyên', '12922'],
          ['Xã Thái Phúc', '12916'],
          ['Xã Thái Thịnh', '12961'],
          ['Xã Thái Thọ', '12961'],
          ['Xã Thái Thượng', '12922'],
          ['Xã Thái Xuyên', '12943'],
          ['Xã Thuần Thành', '12961'],
          ['Xã Thụy Bình', '12826'],
          ['Xã Thụy Chính', '12850'],
          ['Xã Thụy Dân', '12850'],
          ['Xã Thụy Duyên', '12904'],
          ['Xã Thụy Hải', '12826'],
          ['Xã Thụy Hưng', '12865'],
          ['Xã Thụy Liên', '12826'],
          ['Xã Thụy Ninh', '12850'],
          ['Xã Thụy Phong', '12904'],
          ['Xã Thụy Quỳnh', '12859'],
          ['Xã Thụy Sơn', '12865'],
          ['Xã Thụy Thanh', '12904'],
          ['Xã Thụy Trình', '12826'],
          ['Xã Thụy Trường', '12862'],
          ['Xã Thụy Văn', '12859'],
          ['Xã Thụy Việt', '12859'],
          ['Xã Thụy Xuân', '12862']
        ]
      },
      {
        oldDistrict: 'Huyện Tiền Hải',
        wards: [
          ['Thị trấn Tiền Hải', '12970'],
          ['Xã Ái Quốc', '13021'],
          ['Xã An Ninh', '12970'],
          ['Xã Bắc Hải', '13039'],
          ['Xã Đông Cơ', '13003'],
          ['Xã Đông Hoàng', '13003'],
          ['Xã Đông Lâm', '13003'],
          ['Xã Đông Long', '12988'],
          ['Xã Đông Minh', '13003'],
          ['Xã Đông Quang', '12988'],
          ['Xã Đông Trà', '12988'],
          ['Xã Đông Xuyên', '12988'],
          ['Xã Nam Chính', '13057'],
          ['Xã Nam Cường', '13057'],
          ['Xã Nam Hà', '13063'],
          ['Xã Nam Hải', '13063'],
          ['Xã Nam Hồng', '13063'],
          ['Xã Nam Hưng', '13066'],
          ['Xã Nam Phú', '13066'],
          ['Xã Nam Thịnh', '13057'],
          ['Xã Nam Tiến', '13057'],
          ['Xã Nam Trung', '13066'],
          ['Xã Phương Công', '13039'],
          ['Xã Tây Giang', '13021'],
          ['Xã Tây Lương', '12970'],
          ['Xã Tây Ninh', '12970'],
          ['Xã Vân Trường', '13039'],
          ['Xã Vũ Lăng', '12970']
        ]
      },
      {
        oldDistrict: 'Huyện Vũ Thư',
        wards: [
          ['Thị trấn Vũ Thư', '13192'],
          ['Xã Bách Thuận', '13246'],
          ['Xã Dũng Nghĩa', '13192'],
          ['Xã Duy Nhất', '13279'],
          ['Xã Đồng Thanh', '13219'],
          ['Xã Hiệp Hòa', '13222'],
          ['Xã Hòa Bình', '13192'],
          ['Xã Hồng Lý', '13219'],
          ['Xã Hồng Phong', '13279'],
          ['Xã Minh Khai', '13192'],
          ['Xã Minh Lãng', '13222'],
          ['Xã Minh Quang', '13192'],
          ['Xã Nguyên Xá', '12466'],
          ['Xã Phúc Thành', '13225'],
          ['Xã Song An', '12466'],
          ['Xã Song Lãng', '13222'],
          ['Xã Tam Quang', '13192'],
          ['Xã Tân Hòa', '13225'],
          ['Xã Tân Lập', '13246'],
          ['Xã Tân Phong', '13225'],
          ['Xã Trung An', '12466'],
          ['Xã Tự Tân', '13246'],
          ['Xã Việt Hùng', '13219'],
          ['Xã Việt Thuận', '13264'],
          ['Xã Vũ Đoài', '13279'],
          ['Xã Vũ Hội', '13264'],
          ['Xã Vũ Tiến', '13279'],
          ['Xã Vũ Vân', '13264'],
          ['Xã Vũ Vinh', '13264'],
          ['Xã Xuân Hòa', '13219']
        ]
      },
      {
        oldDistrict: 'Thành phố Thái Bình',
        wards: [
          ['Phường Bồ Xuyên', '13225'],
          ['Phường Đề Thám', '12452'],
          ['Phường Hoàng Diệu', '12817'],
          ['Phường Kỳ Bá', '12454'],
          ['Phường Lê Hồng Phong', '13225'],
          ['Phường Phú Khánh', '12466'],
          ['Phường Quang Trung', '12452'],
          ['Phường Tiền Phong', '13225'],
          ['Phường Trần Hưng Đạo', '12452'],
          ['Phường Trần Lãm', '12454'],
          ['Xã Đông Hòa', '12817'],
          ['Xã Đông Mỹ', '12817'],
          ['Xã Đông Thọ', '12817'],
          ['Xã Phú Xuân', '12452'],
          ['Xã Tân Bình', '13225'],
          ['Xã Vũ Chính', '12454'],
          ['Xã Vũ Đông', '12454'],
          ['Xã Vũ Lạc', '12454'],
          ['Xã Vũ Phúc', '12466']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Thái Nguyên',
    districts: [
      {
        oldDistrict: 'Huyện Đại Từ',
        wards: [
          ['Thị trấn Hùng Sơn', '05488'],
          ['Thị trấn Quân Chu', '05851'],
          ['Xã An Khánh', '05809'],
          ['Xã Bản Ngoại', '05800'],
          ['Xã Bình Thuận', '05830'],
          ['Xã Cát Nê', '05851'],
          ['Xã Cù Vân', '05809'],
          ['Xã Đức Lương', '05776'],
          ['Xã Hà Thượng', '05809'],
          ['Xã Hoàng Nông', '05818'],
          ['Xã Khôi Kỳ', '05830'],
          ['Xã La Bằng', '05818'],
          ['Xã Lục Ba', '05830'],
          ['Xã Minh Tiến', '05776'],
          ['Xã Mỹ Yên', '05830'],
          ['Xã Phú Cường', '05800'],
          ['Xã Phú Lạc', '05788'],
          ['Xã Phú Thịnh', '05800'],
          ['Xã Phú Xuyên', '05773'],
          ['Xã Phục Linh', '05788'],
          ['Xã Phúc Lương', '05776'],
          ['Xã Tân Linh', '05788'],
          ['Xã Tân Thái', '05488'],
          ['Xã Tiên Hội', '05818'],
          ['Xã Vạn Phú', '05845'],
          ['Xã Văn Yên', '05845'],
          ['Xã Yên Lãng', '05773']
        ]
      },
      {
        oldDistrict: 'Huyện Định Hóa',
        wards: [
          ['Thị trấn Chợ Chu', '05569'],
          ['Xã Bảo Linh', '05569'],
          ['Xã Bình Thành', '05605'],
          ['Xã Bình Yên', '05587'],
          ['Xã Bộc Nhiêu', '05581'],
          ['Xã Điềm Mặc', '05602'],
          ['Xã Định Biên', '05587'],
          ['Xã Đồng Thịnh', '05569'],
          ['Xã Kim Phượng', '05551'],
          ['Xã Lam Vỹ', '05542'],
          ['Xã Linh Thông', '05542'],
          ['Xã Phú Đình', '05602'],
          ['Xã Phú Tiến', '05581'],
          ['Xã Phúc Chu', '05569'],
          ['Xã Phượng Tiến', '05563'],
          ['Xã Quy Kỳ', '05551'],
          ['Xã Sơn Phú', '05605'],
          ['Xã Tân Dương', '05563'],
          ['Xã Tân Thịnh', '05563'],
          ['Xã Thanh Định', '05587'],
          ['Xã Trung Hội', '05581'],
          ['Xã Trung Lương', '05587']
        ]
      },
      {
        oldDistrict: 'Huyện Đồng Hỷ',
        wards: [
          ['Thị trấn Hóa Thượng', '05692'],
          ['Thị trấn Sông Cầu', '05692'],
          ['Thị trấn Trại Cau', '05662'],
          ['Xã Cây Thị', '05707'],
          ['Xã Hòa Bình', '05665'],
          ['Xã Hóa Trung', '05692'],
          ['Xã Hợp Tiến', '05662'],
          ['Xã Khe Mo', '05680'],
          ['Xã Minh Lập', '05692'],
          ['Xã Nam Hòa', '05707'],
          ['Xã Quang Sơn', '05674'],
          ['Xã Tân Long', '05674'],
          ['Xã Văn Hán', '05680'],
          ['Xã Văn Lăng', '05665']
        ]
      },
      {
        oldDistrict: 'Huyện Phú Bình',
        wards: [
          ['Thị trấn Hương Sơn', '05908'],
          ['Xã Bàn Đạt', '05917'],
          ['Xã Bảo Lý', '05908'],
          ['Xã Dương Thành', '05953'],
          ['Xã Đào Xá', '05917'],
          ['Xã Điềm Thụy', '05941'],
          ['Xã Hà Châu', '05941'],
          ['Xã Kha Sơn', '05953'],
          ['Xã Lương Phú', '05953'],
          ['Xã Nga My', '05941'],
          ['Xã Nhã Lộng', '05908'],
          ['Xã Tân Đức', '05953'],
          ['Xã Tân Hòa', '05923'],
          ['Xã Tân Khánh', '05917'],
          ['Xã Tân Kim', '05923'],
          ['Xã Tân Thành', '05923'],
          ['Xã Thanh Ninh', '05953'],
          ['Xã Thượng Đình', '05941'],
          ['Xã Úc Kỳ', '05908'],
          ['Xã Xuân Phương', '05908']
        ]
      },
      {
        oldDistrict: 'Huyện Phú Lương',
        wards: [
          ['Thị trấn Đu', '05611'],
          ['Thị trấn Giang Tiên', '05611'],
          ['Xã Cổ Lũng', '05641'],
          ['Xã Động Đạt', '05611'],
          ['Xã Hợp Thành', '05632'],
          ['Xã Ôn Lương', '05632'],
          ['Xã Phú Đô', '05641'],
          ['Xã Phủ Lý', '05632'],
          ['Xã Tức Tranh', '05641'],
          ['Xã Vô Tranh', '05641'],
          ['Xã Yên Đổ', '05620'],
          ['Xã Yên Lạc', '05611'],
          ['Xã Yên Ninh', '05620'],
          ['Xã Yên Trạch', '05620']
        ]
      },
      {
        oldDistrict: 'Huyện Võ Nhai',
        wards: [
          ['Thị trấn Đình Cả', '05716'],
          ['Xã Bình Long', '05755'],
          ['Xã Cúc Đường', '05740'],
          ['Xã Dân Tiến', '05755'],
          ['Xã La Hiên', '05740'],
          ['Xã Lâu Thượng', '05716'],
          ['Xã Liên Minh', '05746'],
          ['Xã Nghinh Tường', '05722'],
          ['Xã Phú Thượng', '05716'],
          ['Xã Phương Giao', '05755'],
          ['Xã Sảng Mộc', '05719'],
          ['Xã Thần Xa', '05725'],
          ['Xã Thượng Nung', '05725'],
          ['Xã Tràng Xá', '05746'],
          ['Xã Vũ Chấn', '05722']
        ]
      },
      {
        oldDistrict: 'Thành phố Phổ Yên',
        wards: [
          ['Phường Ba Hàng', '05860'],
          ['Phường Bãi Bông', '05860'],
          ['Phường Bắc Sơn', '05857'],
          ['Phường Đắc Sơn', '05860'],
          ['Phường Đông Cao', '05899'],
          ['Phường Đồng Tiến', '05890'],
          ['Phường Hồng Tiến', '05860'],
          ['Phường Nam Tiến', '05890'],
          ['Phường Tân Hương', '05890'],
          ['Phường Tân Phú', '05899'],
          ['Phường Thuận Thành', '05899'],
          ['Phường Tiên Phong', '05890'],
          ['Phường Trung Thành', '05899'],
          ['Xã Minh Đức', '05857'],
          ['Xã Phúc Tân', '05488'],
          ['Xã Phúc Thuận', '05857'],
          ['Xã Thành Công', '05881'],
          ['Xã Vạn Phái', '05881']
        ]
      },
      {
        oldDistrict: 'Thành phố Sông Công',
        wards: [
          ['Phường Bách Quang', '05528'],
          ['Phường Cải Đan', '05518'],
          ['Phường Châu Sơn', '05533'],
          ['Phường Lương Sơn', '05528'],
          ['Phường Mỏ Chè', '05533'],
          ['Phường Phố Cò', '05518'],
          ['Phường Thắng Lợi', '05518'],
          ['Xã Bá Xuyên', '05533'],
          ['Xã Bình Sơn', '05503'],
          ['Xã Tân Quang', '05528']
        ]
      },
      {
        oldDistrict: 'Thành phố Thái Nguyên',
        wards: [
          ['Phường Cam Giá', '05467'],
          ['Phường Chùa Hang', '05710'],
          ['Phường Đồng Bẩm', '05710'],
          ['Phường Đồng Quang', '05443'],
          ['Phường Gia Sàng', '05467'],
          ['Phường Hoàng Văn Thụ', '05443'],
          ['Phường Hương Sơn', '05467'],
          ['Phường Phan Đình Phùng', '05443'],
          ['Phường Phú Xá', '05500'],
          ['Phường Quán Triều', '05482'],
          ['Phường Quang Trung', '05443'],
          ['Phường Quang Vinh', '05482'],
          ['Phường Tân Lập', '05500'],
          ['Phường Tân Long', '05482'],
          ['Phường Tân Thành', '05500'],
          ['Phường Tân Thịnh', '05443'],
          ['Phường Thịnh Đán', '05455'],
          ['Phường Tích Lương', '05500'],
          ['Phường Trung Thành', '05500'],
          ['Phường Trưng Vương', '05443'],
          ['Phường Túc Duyên', '05443'],
          ['Xã Cao Ngạn', '05710'],
          ['Xã Đồng Liên', '05467'],
          ['Xã Huống Thượng', '05710'],
          ['Xã Linh Sơn', '05710'],
          ['Xã Phúc Hà', '05455'],
          ['Xã Phúc Trìu', '05488'],
          ['Xã Phúc Xuân', '05488'],
          ['Xã Quyết Thắng', '05455'],
          ['Xã Sơn Cẩm', '05482'],
          ['Xã Tân Cương', '05503'],
          ['Xã Thịnh Đức', '05503']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Thanh Hóa',
    districts: [
      {
        oldDistrict: 'Huyện Bá Thước',
        wards: [
          ['Thị trấn Cành Nàng', '14923'],
          ['Xã Ái Thượng', '14950'],
          ['Xã Ban Công', '14923'],
          ['Xã Cổ Lũng', '14959'],
          ['Xã Điền Hạ', '14932'],
          ['Xã Điền Lư', '14950'],
          ['Xã Điền Quang', '14932'],
          ['Xã Điền Thượng', '14932'],
          ['Xã Điền Trung', '14950'],
          ['Xã Hạ Trung', '14923'],
          ['Xã Kỳ Tân', '14974'],
          ['Xã Lũng Cao', '14959'],
          ['Xã Lũng Niêm', '14956'],
          ['Xã Lương Ngoại', '14953'],
          ['Xã Lương Nội', '14953'],
          ['Xã Lương Trung', '14953'],
          ['Xã Thành Lâm', '14956'],
          ['Xã Thành Sơn', '14956'],
          ['Xã Thiết Kế', '14980'],
          ['Xã Thiết Ống', '14980'],
          ['Xã Văn Nho', '14974']
        ]
      },
      {
        oldDistrict: 'Huyện Cẩm Thủy',
        wards: [
          ['Thị trấn Phong Sơn', '15127'],
          ['Xã Cẩm Bình', '15142'],
          ['Xã Cẩm Châu', '15163'],
          ['Xã Cẩm Giang', '15148'],
          ['Xã Cẩm Liên', '15142'],
          ['Xã Cẩm Long', '15178'],
          ['Xã Cẩm Lương', '15148'],
          ['Xã Cẩm Ngọc', '15127'],
          ['Xã Cẩm Phú', '15178'],
          ['Xã Cẩm Quý', '15148'],
          ['Xã Cẩm Tâm', '15163'],
          ['Xã Cẩm Tân', '15178'],
          ['Xã Cẩm Thạch', '15142'],
          ['Xã Cẩm Thành', '15142'],
          ['Xã Cẩm Tú', '15148'],
          ['Xã Cẩm Vân', '15163'],
          ['Xã Cẩm Yên', '15163']
        ]
      },
      {
        oldDistrict: 'Huyện Hà Trung',
        wards: [
          ['Thị trấn Hà Lĩnh', '15316'],
          ['Thị trấn Hà Long', '15274'],
          ['Thị trấn Hà Trung', '15271'],
          ['Xã Hà Bắc', '15274'],
          ['Xã Hà Bình', '15286'],
          ['Xã Hà Châu', '15298'],
          ['Xã Hà Đông', '15271'],
          ['Xã Hà Giang', '15274'],
          ['Xã Hà Hải', '15298'],
          ['Xã Hà Ngọc', '15271'],
          ['Xã Hà Sơn', '15316'],
          ['Xã Hà Tân', '15316'],
          ['Xã Hà Tiến', '15316'],
          ['Xã Hà Vinh', '14812'],
          ['Xã Hoạt Giang', '15286'],
          ['Xã Lĩnh Toại', '15298'],
          ['Xã Thái Lai', '15298'],
          ['Xã Yên Dương', '15286'],
          ['Xã Yến Sơn', '15271']
        ]
      },
      {
        oldDistrict: 'Huyện Hậu Lộc',
        wards: [
          ['Thị trấn Hậu Lộc', '16012'],
          ['Xã Cầu Lộc', '16033'],
          ['Xã Đa Lộc', '16078'],
          ['Xã Đại Lộc', '16021'],
          ['Xã Đồng Lộc', '16033'],
          ['Xã Hải Lộc', '16078'],
          ['Xã Hoa Lộc', '16072'],
          ['Xã Hòa Lộc', '16072'],
          ['Xã Hưng Lộc', '16078'],
          ['Xã Liên Lộc', '16072'],
          ['Xã Lộc Sơn', '16012'],
          ['Xã Minh Lộc', '16078'],
          ['Xã Mỹ Lộc', '16012'],
          ['Xã Ngư Lộc', '16078'],
          ['Xã Phú Lộc', '16072'],
          ['Xã Quang Lộc', '16072'],
          ['Xã Thành Lộc', '16033'],
          ['Xã Thuần Lộc', '16012'],
          ['Xã Tiến Lộc', '16021'],
          ['Xã Triệu Lộc', '16021'],
          ['Xã Tuy Lộc', '16033'],
          ['Xã Xuân Lộc', '16072']
        ]
      },
      {
        oldDistrict: 'Huyện Hoằng Hóa',
        wards: [
          ['Thị trấn Bút Sơn', '15865'],
          ['Xã Hoằng Cát', '15910'],
          ['Xã Hoằng Châu', '15976'],
          ['Xã Hoằng Đạo', '15865'],
          ['Xã Hoằng Đạt', '15865'],
          ['Xã Hoằng Đồng', '15865'],
          ['Xã Hoằng Đông', '16000'],
          ['Xã Hoằng Đức', '15865'],
          ['Xã Hoằng Giang', '15880'],
          ['Xã Hoằng Hà', '15865'],
          ['Xã Hoằng Hải', '15991'],
          ['Xã Hoằng Hợp', '15880'],
          ['Xã Hoằng Kim', '15889'],
          ['Xã Hoằng Lộc', '15961'],
          ['Xã Hoằng Lưu', '15976'],
          ['Xã Hoằng Ngọc', '16000'],
          ['Xã Hoằng Phong', '15976'],
          ['Xã Hoằng Phú', '15889'],
          ['Xã Hoằng Phụ', '16000'],
          ['Xã Hoằng Quỳ', '15880'],
          ['Xã Hoằng Quý', '15889'],
          ['Xã Hoằng Sơn', '15910'],
          ['Xã Hoằng Tân', '15961'],
          ['Xã Hoằng Thái', '15961'],
          ['Xã Hoằng Thành', '15961'],
          ['Xã Hoằng Thanh', '16000'],
          ['Xã Hoằng Thắng', '15976'],
          ['Xã Hoằng Thịnh', '15961'],
          ['Xã Hoằng Tiến', '15991'],
          ['Xã Hoằng Trạch', '15961'],
          ['Xã Hoằng Trinh', '15910'],
          ['Xã Hoằng Trung', '15889'],
          ['Xã Hoằng Trường', '15991'],
          ['Xã Hoằng Xuân', '15880'],
          ['Xã Hoằng Xuyên', '15910'],
          ['Xã Hoằng Yến', '15991']
        ]
      },
      {
        oldDistrict: 'Huyện Lang Chánh',
        wards: [
          ['Thị trấn Lang Chánh', '15055'],
          ['Xã Đồng Lương', '15058'],
          ['Xã Giao An', '15043'],
          ['Xã Giao Thiện', '15043'],
          ['Xã Lâm Phú', '15049'],
          ['Xã Tam Văn', '15049'],
          ['Xã Tân Phúc', '15058'],
          ['Xã Trí Nang', '15055'],
          ['Xã Yên Khương', '15031'],
          ['Xã Yên Thắng', '15034']
        ]
      },
      {
        oldDistrict: 'Huyện Mường Lát',
        wards: [
          ['Thị trấn Mường Lát', '14845'],
          ['Xã Mường Chanh', '14866'],
          ['Xã Mường Lý', '14854'],
          ['Xã Nhi Sơn', '14864'],
          ['Xã Pù Nhi', '14863'],
          ['Xã Quang Chiểu', '14860'],
          ['Xã Tam Chung', '14848'],
          ['Xã Trung Lý', '14857']
        ]
      },
      {
        oldDistrict: 'Huyện Nga Sơn',
        wards: [
          ['Thị trấn Nga Sơn', '16093'],
          ['Xã Ba Đình', '16171'],
          ['Xã Nga An', '16144'],
          ['Xã Nga Điền', '16144'],
          ['Xã Nga Giáp', '16138'],
          ['Xã Nga Hải', '16138'],
          ['Xã Nga Hiệp', '16093'],
          ['Xã Nga Liên', '16138'],
          ['Xã Nga Phú', '16144'],
          ['Xã Nga Phượng', '16114'],
          ['Xã Nga Tân', '16108'],
          ['Xã Nga Thạch', '16114'],
          ['Xã Nga Thái', '16108'],
          ['Xã Nga Thành', '16138'],
          ['Xã Nga Thanh', '16093'],
          ['Xã Nga Thắng', '16114'],
          ['Xã Nga Thiện', '16171'],
          ['Xã Nga Thủy', '16093'],
          ['Xã Nga Tiến', '16108'],
          ['Xã Nga Trường', '16171'],
          ['Xã Nga Văn', '16114'],
          ['Xã Nga Vịnh', '16171'],
          ['Xã Nga Yên', '16093']
        ]
      },
      {
        oldDistrict: 'Huyện Ngọc Lặc',
        wards: [
          ['Thị trấn Ngọc Lặc', '15061'],
          ['Xã Cao Ngọc', '15124'],
          ['Xã Cao Thịnh', '15091'],
          ['Xã Đồng Thịnh', '15085'],
          ['Xã Kiên Thọ', '15112'],
          ['Xã Lam Sơn', '15124'],
          ['Xã Lộc Thịnh', '15091'],
          ['Xã Minh Sơn', '15124'],
          ['Xã Minh Tiến', '15124'],
          ['Xã Mỹ Tân', '15061'],
          ['Xã Ngọc Liên', '15091'],
          ['Xã Ngọc Sơn', '15091'],
          ['Xã Ngọc Trung', '15091'],
          ['Xã Nguyệt Ấn', '15106'],
          ['Xã Phúc Thịnh', '15112'],
          ['Xã Phùng Giáo', '15106'],
          ['Xã Phùng Minh', '15112'],
          ['Xã Quang Trung', '15085'],
          ['Xã Thạch Lập', '15085'],
          ['Xã Thúy Sơn', '15061'],
          ['Xã Vân Âm', '15106']
        ]
      },
      {
        oldDistrict: 'Huyện Như Thanh',
        wards: [
          ['Thị trấn Bến Sung', '16228'],
          ['Xã Cán Khê', '16234'],
          ['Xã Hải Long', '16228'],
          ['Xã Mậu Lâm', '16249'],
          ['Xã Phú Nhuận', '16249'],
          ['Xã Phượng Nghi', '16234'],
          ['Xã Thanh Kỳ', '16273'],
          ['Xã Thanh Tân', '16273'],
          ['Xã Xuân Du', '16234'],
          ['Xã Xuân Khang', '16228'],
          ['Xã Xuân Phúc', '16264'],
          ['Xã Xuân Thái', '16258'],
          ['Xã Yên Lạc', '16264'],
          ['Xã Yên Thọ', '16264']
        ]
      },
      {
        oldDistrict: 'Huyện Như Xuân',
        wards: [
          ['Thị trấn Yên Cát', '16174'],
          ['Xã Bãi Trành', '16177'],
          ['Xã Bình Lương', '16186'],
          ['Xã Cát Tân', '16225'],
          ['Xã Cát Vân', '16225'],
          ['Xã Hóa Quỳ', '16186'],
          ['Xã Tân Bình', '16174'],
          ['Xã Thanh Hòa', '16213'],
          ['Xã Thanh Lâm', '16213'],
          ['Xã Thanh Phong', '16213'],
          ['Xã Thanh Quân', '16222'],
          ['Xã Thanh Sơn', '16222'],
          ['Xã Thanh Xuân', '16222'],
          ['Xã Thượng Ninh', '16225'],
          ['Xã Xuân Bình', '16177'],
          ['Xã Xuân Hòa', '16177']
        ]
      },
      {
        oldDistrict: 'Huyện Nông Cống',
        wards: [
          ['Thị trấn Nông Cống', '16279'],
          ['Xã Công Chính', '16369'],
          ['Xã Công Liêm', '16369'],
          ['Xã Hoàng Giang', '16297'],
          ['Xã Hoàng Sơn', '16297'],
          ['Xã Minh Khôi', '16279'],
          ['Xã Minh Nghĩa', '16279'],
          ['Xã Tân Khang', '16297'],
          ['Xã Tân Phúc', '16297'],
          ['Xã Tân Thọ', '16297'],
          ['Xã Tế Lợi', '16309'],
          ['Xã Tế Nông', '16309'],
          ['Xã Tế Thắng', '16309'],
          ['Xã Thăng Bình', '16342'],
          ['Xã Thăng Long', '16342'],
          ['Xã Thăng Thọ', '16342'],
          ['Xã Trung Chính', '16297'],
          ['Xã Trung Thành', '16309'],
          ['Xã Trường Giang', '16348'],
          ['Xã Trường Minh', '16348'],
          ['Xã Trường Sơn', '16348'],
          ['Xã Trường Trung', '16348'],
          ['Xã Tượng Lĩnh', '16363'],
          ['Xã Tượng Sơn', '16363'],
          ['Xã Tượng Văn', '16363'],
          ['Xã Vạn Hòa', '16279'],
          ['Xã Vạn Thắng', '16279'],
          ['Xã Vạn Thiện', '16279'],
          ['Xã Yên Mỹ', '16369']
        ]
      },
      {
        oldDistrict: 'Huyện Quan Hóa',
        wards: [
          ['Thị trấn Hồi Xuân', '14869'],
          ['Xã Hiền Chung', '14896'],
          ['Xã Hiền Kiệt', '14896'],
          ['Xã Nam Động', '14908'],
          ['Xã Nam Tiến', '14902'],
          ['Xã Nam Xuân', '14902'],
          ['Xã Phú Lệ', '14878'],
          ['Xã Phú Nghiêm', '14869'],
          ['Xã Phú Sơn', '14878'],
          ['Xã Phú Thanh', '14878'],
          ['Xã Phú Xuân', '14890'],
          ['Xã Thành Sơn', '14872'],
          ['Xã Thiên Phủ', '14908'],
          ['Xã Trung Sơn', '14875'],
          ['Xã Trung Thành', '14872']
        ]
      },
      {
        oldDistrict: 'Huyện Quan Sơn',
        wards: [
          ['Thị trấn Sơn Lư', '15016'],
          ['Xã Mường Mìn', '15025'],
          ['Xã Na Mèo', '15013'],
          ['Xã Sơn Điện', '15022'],
          ['Xã Sơn Hà', '15019'],
          ['Xã Sơn Thủy', '15010'],
          ['Xã Tam Lư', '15019'],
          ['Xã Tam Thanh', '15007'],
          ['Xã Trung Hạ', '15001'],
          ['Xã Trung Thượng', '15016'],
          ['Xã Trung Tiến', '15001'],
          ['Xã Trung Xuân', '15001']
        ]
      },
      {
        oldDistrict: 'Huyện Quảng Xương',
        wards: [
          ['Thị trấn Tân Phong', '16438'],
          ['Xã Quảng Bình', '16543'],
          ['Xã Quảng Chính', '16489'],
          ['Xã Quảng Định', '16438'],
          ['Xã Quảng Đức', '16438'],
          ['Xã Quảng Giao', '16516'],
          ['Xã Quảng Hải', '16540'],
          ['Xã Quảng Hòa', '16480'],
          ['Xã Quảng Hợp', '16498'],
          ['Xã Quảng Khê', '16489'],
          ['Xã Quảng Long', '16480'],
          ['Xã Quảng Lộc', '16543'],
          ['Xã Quảng Lưu', '16543'],
          ['Xã Quảng Ngọc', '16498'],
          ['Xã Quảng Nham', '16549'],
          ['Xã Quảng Nhân', '16540'],
          ['Xã Quảng Ninh', '16540'],
          ['Xã Quảng Phúc', '16498'],
          ['Xã Quảng Thạch', '16549'],
          ['Xã Quảng Thái', '16543'],
          ['Xã Quảng Trạch', '16480'],
          ['Xã Quảng Trung', '16489'],
          ['Xã Quảng Trường', '16489'],
          ['Xã Quảng Văn', '16498'],
          ['Xã Quảng Yên', '16480'],
          ['Xã Tiên Trang', '16549']
        ]
      },
      {
        oldDistrict: 'Huyện Thạch Thành',
        wards: [
          ['Thị trấn Kim Tân', '15187'],
          ['Thị trấn Vân Du', '15190'],
          ['Xã Ngọc Trạo', '15250'],
          ['Xã Thạch Bình', '15211'],
          ['Xã Thạch Cẩm', '15211'],
          ['Xã Thạch Định', '15187'],
          ['Xã Thạch Lâm', '15199'],
          ['Xã Thạch Long', '15211'],
          ['Xã Thạch Quảng', '15199'],
          ['Xã Thạch Sơn', '15211'],
          ['Xã Thạch Tượng', '15199'],
          ['Xã Thành An', '15250'],
          ['Xã Thành Công', '15190'],
          ['Xã Thành Hưng', '15187'],
          ['Xã Thành Long', '15250'],
          ['Xã Thành Minh', '15229'],
          ['Xã Thành Mỹ', '15229'],
          ['Xã Thành Tâm', '15250'],
          ['Xã Thành Tân', '15190'],
          ['Xã Thành Thọ', '15187'],
          ['Xã Thành Tiến', '15187'],
          ['Xã Thành Trực', '15187'],
          ['Xã Thành Vinh', '15229'],
          ['Xã Thành Yên', '15229']
        ]
      },
      {
        oldDistrict: 'Huyện Thiệu Hóa',
        wards: [
          ['Thị trấn Hậu Hiền', '15820'],
          ['Thị trấn Thiệu Hóa', '15772'],
          ['Xã Tân Châu', '15853'],
          ['Xã Thiệu Chính', '15820'],
          ['Xã Thiệu Công', '15772'],
          ['Xã Thiệu Duy', '15796'],
          ['Xã Thiệu Giang', '15796'],
          ['Xã Thiệu Giao', '15853'],
          ['Xã Thiệu Hòa', '15820'],
          ['Xã Thiệu Hợp', '15796'],
          ['Xã Thiệu Long', '15772'],
          ['Xã Thiệu Lý', '15835'],
          ['Xã Thiệu Ngọc', '15778'],
          ['Xã Thiệu Nguyên', '15772'],
          ['Xã Thiệu Phúc', '15772'],
          ['Xã Thiệu Quang', '15796'],
          ['Xã Thiệu Thành', '15778'],
          ['Xã Thiệu Thịnh', '15796'],
          ['Xã Thiệu Tiến', '15778'],
          ['Xã Thiệu Toán', '15820'],
          ['Xã Thiệu Trung', '15835'],
          ['Xã Thiệu Vận', '15835'],
          ['Xã Thiệu Viên', '15835'],
          ['Xã Thiệu Vũ', '15778']
        ]
      },
      {
        oldDistrict: 'Huyện Thọ Xuân',
        wards: [
          ['Thị trấn Lam Sơn', '15544'],
          ['Thị trấn Sao Vàng', '15553'],
          ['Thị trấn Thọ Xuân', '15499'],
          ['Xã Bắc Lương', '15505'],
          ['Xã Nam Giang', '15505'],
          ['Xã Phú Xuân', '15574'],
          ['Xã Quảng Phú', '15574'],
          ['Xã Tây Hồ', '15505'],
          ['Xã Thọ Diên', '15520'],
          ['Xã Thọ Hải', '15520'],
          ['Xã Thọ Lâm', '15553'],
          ['Xã Thọ Lập', '15568'],
          ['Xã Thọ Lộc', '15505'],
          ['Xã Thọ Xương', '15544'],
          ['Xã Thuận Minh', '15568'],
          ['Xã Trường Xuân', '15592'],
          ['Xã Xuân Bái', '15544'],
          ['Xã Xuân Giang', '15499'],
          ['Xã Xuân Hòa', '15520'],
          ['Xã Xuân Hồng', '15499'],
          ['Xã Xuân Hưng', '15520'],
          ['Xã Xuân Lai', '15592'],
          ['Xã Xuân Lập', '15592'],
          ['Xã Xuân Minh', '15592'],
          ['Xã Xuân Phong', '15505'],
          ['Xã Xuân Phú', '15553'],
          ['Xã Xuân Sinh', '15553'],
          ['Xã Xuân Thiên', '15568'],
          ['Xã Xuân Tín', '15574'],
          ['Xã Xuân Trường', '15499']
        ]
      },
      {
        oldDistrict: 'Huyện Thường Xuân',
        wards: [
          ['Thị trấn Thường Xuân', '15646'],
          ['Xã Bát Mọt', '15607'],
          ['Xã Luận Khê', '15661'],
          ['Xã Luận Thành', '15634'],
          ['Xã Lương Sơn', '15628'],
          ['Xã Ngọc Phụng', '15646'],
          ['Xã Tân Thành', '15661'],
          ['Xã Thọ Thanh', '15646'],
          ['Xã Vạn Xuân', '15622'],
          ['Xã Xuân Cao', '15634'],
          ['Xã Xuân Chinh', '15658'],
          ['Xã Xuân Dương', '15646'],
          ['Xã Xuân Lẹ', '15658'],
          ['Xã Xuân Lộc', '15643'],
          ['Xã Xuân Thắng', '15643'],
          ['Xã Yên Nhân', '15610']
        ]
      },
      {
        oldDistrict: 'Huyện Triệu Sơn',
        wards: [
          ['Thị trấn Nưa', '15715'],
          ['Thị trấn Triệu Sơn', '15664'],
          ['Xã An Nông', '15766'],
          ['Xã Bình Sơn', '15667'],
          ['Xã Dân Lực', '15664'],
          ['Xã Dân Lý', '15664'],
          ['Xã Dân Quyền', '15664'],
          ['Xã Đồng Lợi', '15724'],
          ['Xã Đồng Thắng', '15724'],
          ['Xã Đồng Tiến', '15724'],
          ['Xã Hợp Lý', '15682'],
          ['Xã Hợp Thành', '15682'],
          ['Xã Hợp Thắng', '15682'],
          ['Xã Hợp Tiến', '15682'],
          ['Xã Khuyến Nông', '15766'],
          ['Xã Minh Sơn', '15664'],
          ['Xã Nông Trường', '15766'],
          ['Xã Thái Hòa', '15715'],
          ['Xã Thọ Bình', '15667'],
          ['Xã Thọ Cường', '15754'],
          ['Xã Thọ Dân', '15763'],
          ['Xã Thọ Ngọc', '15754'],
          ['Xã Thọ Phú', '15763'],
          ['Xã Thọ Sơn', '15667'],
          ['Xã Thọ Tân', '15763'],
          ['Xã Thọ Thế', '15763'],
          ['Xã Thọ Tiến', '15754'],
          ['Xã Tiến Nông', '15766'],
          ['Xã Triệu Thành', '15682'],
          ['Xã Văn Sơn', '15715'],
          ['Xã Xuân Lộc', '15763'],
          ['Xã Xuân Thọ', '15754']
        ]
      },
      {
        oldDistrict: 'Huyện Vĩnh Lộc',
        wards: [
          ['Thị trấn Vĩnh Lộc', '15349'],
          ['Xã Minh Tân', '15382'],
          ['Xã Ninh Khang', '15349'],
          ['Xã Vĩnh An', '15382'],
          ['Xã Vĩnh Hòa', '15349'],
          ['Xã Vĩnh Hùng', '15382'],
          ['Xã Vĩnh Hưng', '15349'],
          ['Xã Vĩnh Long', '15361'],
          ['Xã Vĩnh Phúc', '15349'],
          ['Xã Vĩnh Quang', '15361'],
          ['Xã Vĩnh Thịnh', '15382'],
          ['Xã Vĩnh Tiến', '15361'],
          ['Xã Vĩnh Yên', '15361']
        ]
      },
      {
        oldDistrict: 'Huyện Yên Định',
        wards: [
          ['Thị trấn Quán Lào', '15469'],
          ['Thị trấn Quý Lộc', '15412'],
          ['Thị trấn Thống Nhất', '15409'],
          ['Thị trấn Yên Lâm', '15412'],
          ['Xã Định Bình', '15448'],
          ['Xã Định Công', '15448'],
          ['Xã Định Hải', '15457'],
          ['Xã Định Hòa', '15448'],
          ['Xã Định Hưng', '15457'],
          ['Xã Định Liên', '15469'],
          ['Xã Định Long', '15469'],
          ['Xã Định Tăng', '15469'],
          ['Xã Định Tân', '15457'],
          ['Xã Định Thành', '15448'],
          ['Xã Định Tiến', '15457'],
          ['Xã Yên Hùng', '15442'],
          ['Xã Yên Ninh', '15442'],
          ['Xã Yên Phong', '15421'],
          ['Xã Yên Phú', '15409'],
          ['Xã Yên Tâm', '15409'],
          ['Xã Yên Thái', '15421'],
          ['Xã Yên Thịnh', '15442'],
          ['Xã Yên Thọ', '15412'],
          ['Xã Yên Trung', '15421'],
          ['Xã Yên Trường', '15421']
        ]
      },
      {
        oldDistrict: 'Thành phố Sầm Sơn',
        wards: [
          ['Phường Bắc Sơn', '16531'],
          ['Phường Quảng Châu', '16531'],
          ['Phường Quảng Cư', '16531'],
          ['Phường Quảng Thọ', '16531'],
          ['Phường Quảng Tiến', '16531'],
          ['Phường Quảng Vinh', '16516'],
          ['Phường Trung Sơn', '16531'],
          ['Phường Trường Sơn', '16531'],
          ['Xã Đại Hùng', '16516'],
          ['Xã Quảng Minh', '16516']
        ]
      },
      {
        oldDistrict: 'Thành phố Thanh Hóa',
        wards: [
          ['Phường An Hưng', '16417'],
          ['Phường Ba Đình', '14797'],
          ['Phường Điện Biên', '14797'],
          ['Phường Đông Cương', '14758'],
          ['Phường Đông Hải', '14797'],
          ['Phường Đông Hương', '14797'],
          ['Phường Đông Lĩnh', '15853'],
          ['Phường Đông Sơn', '14797'],
          ['Phường Đông Tân', '16378'],
          ['Phường Đông Thịnh', '16378'],
          ['Phường Đông Thọ', '14758'],
          ['Phường Đông Vệ', '14797'],
          ['Phường Hàm Rồng', '14758'],
          ['Phường Hoằng Đại', '15925'],
          ['Phường Hoằng Quang', '15925'],
          ['Phường Lam Sơn', '14797'],
          ['Phường Long Anh', '15925'],
          ['Phường Nam Ngạn', '14758'],
          ['Phường Ngọc Trạo', '14797'],
          ['Phường Phú Sơn', '14797'],
          ['Phường Quảng Cát', '16522'],
          ['Phường Quảng Đông', '16522'],
          ['Phường Quảng Hưng', '16522'],
          ['Phường Quảng Phú', '16522'],
          ['Phường Quảng Tâm', '16522'],
          ['Phường Quảng Thành', '16522'],
          ['Phường Quảng Thắng', '16417'],
          ['Phường Quảng Thịnh', '16522'],
          ['Phường Rừng Thông', '16378'],
          ['Phường Tào Xuyên', '15925'],
          ['Phường Thiệu Dương', '14758'],
          ['Phường Thiệu Khánh', '15853'],
          ['Phường Trường Thi', '14797'],
          ['Xã Đông Hòa', '16378'],
          ['Xã Đông Hoàng', '16378'],
          ['Xã Đông Khê', '16378'],
          ['Xã Đông Minh', '16378'],
          ['Xã Đông Nam', '16417'],
          ['Xã Đông Ninh', '16378'],
          ['Xã Đông Phú', '16417'],
          ['Xã Đông Quang', '16417'],
          ['Xã Đông Thanh', '15853'],
          ['Xã Đông Tiến', '15853'],
          ['Xã Đông Văn', '16417'],
          ['Xã Đông Vinh', '16417'],
          ['Xã Đông Yên', '16417'],
          ['Xã Thiệu Vân', '15853']
        ]
      },
      {
        oldDistrict: 'Thị xã Bỉm Sơn',
        wards: [
          ['Phường Ba Đình', '14812'],
          ['Phường Bắc Sơn', '14818'],
          ['Phường Đông Sơn', '14812'],
          ['Phường Lam Sơn', '14812'],
          ['Phường Ngọc Trạo', '14818'],
          ['Phường Phú Sơn', '14818'],
          ['Xã Quang Trung', '14818']
        ]
      },
      {
        oldDistrict: 'Thị xã Nghi Sơn',
        wards: [
          ['Phường Bình Minh', '16561'],
          ['Phường Hải An', '16594'],
          ['Phường Hải Bình', '16645'],
          ['Phường Hải Châu', '16576'],
          ['Phường Hải Hòa', '16561'],
          ['Phường Hải Lĩnh', '16597'],
          ['Phường Hải Ninh', '16576'],
          ['Phường Hải Thanh', '16561'],
          ['Phường Hải Thượng', '16654'],
          ['Phường Mai Lâm', '16645'],
          ['Phường Nguyên Bình', '16609'],
          ['Phường Ninh Hải', '16597'],
          ['Phường Tân Dân', '16594'],
          ['Phường Tĩnh Hải', '16645'],
          ['Phường Trúc Lâm', '16624'],
          ['Phường Xuân Lâm', '16609'],
          ['Xã Anh Sơn', '16591'],
          ['Xã Các Sơn', '16591'],
          ['Xã Định Hải', '16597'],
          ['Xã Hải Hà', '16654'],
          ['Xã Hải Nhân', '16561'],
          ['Xã Nghi Sơn', '16654'],
          ['Xã Ngọc Lĩnh', '16594'],
          ['Xã Phú Lâm', '16624'],
          ['Xã Phú Sơn', '16624'],
          ['Xã Tân Trường', '16636'],
          ['Xã Thanh Sơn', '16576'],
          ['Xã Thanh Thủy', '16576'],
          ['Xã Trường Lâm', '16636'],
          ['Xã Tùng Lâm', '16624']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Tiền Giang',
    districts: [
      {
        oldDistrict: 'Huyện Cái Bè',
        wards: [
          ['Thị trấn Cái Bè', '28360'],
          ['Xã An Cư', '28393'],
          ['Xã An Hữu', '28429'],
          ['Xã An Thái Đông', '28414'],
          ['Xã An Thái Trung', '28426'],
          ['Xã Đông Hòa Hiệp', '28360'],
          ['Xã Hậu Mỹ Bắc A', '28366'],
          ['Xã Hậu Mỹ Bắc B', '28366'],
          ['Xã Hậu Mỹ Phú', '28393'],
          ['Xã Hậu Mỹ Trinh', '28366'],
          ['Xã Hậu Thành', '28393'],
          ['Xã Hòa Hưng', '28429'],
          ['Xã Hòa Khánh', '28360'],
          ['Xã Mỹ Đức Đông', '28405'],
          ['Xã Mỹ Đức Tây', '28405'],
          ['Xã Mỹ Hội', '28393'],
          ['Xã Mỹ Lợi A', '28414'],
          ['Xã Mỹ Lợi B', '28414'],
          ['Xã Mỹ Lương', '28429'],
          ['Xã Mỹ Tân', '28378'],
          ['Xã Mỹ Trung', '28378'],
          ['Xã Tân Hưng', '28426'],
          ['Xã Tân Thanh', '28426'],
          ['Xã Thiện Trí', '28405'],
          ['Xã Thiện Trung', '28378']
        ]
      },
      {
        oldDistrict: 'Huyện Cai Lậy',
        wards: [
          ['Thị trấn Bình Phú', '28471'],
          ['Xã Cẩm Sơn', '28471'],
          ['Xã Hiệp Đức', '28501'],
          ['Xã Hội Xuân', '28501'],
          ['Xã Long Tiên', '28504'],
          ['Xã Long Trung', '28504'],
          ['Xã Mỹ Long', '28504'],
          ['Xã Mỹ Thành Bắc', '28456'],
          ['Xã Mỹ Thành Nam', '28456'],
          ['Xã Ngũ Hiệp', '28516'],
          ['Xã Phú An', '28471'],
          ['Xã Phú Cường', '28444'],
          ['Xã Phú Nhuận', '28456'],
          ['Xã Tam Bình', '28516'],
          ['Xã Tân Phong', '28501'],
          ['Xã Thạnh Lộc', '28444']
        ]
      },
      {
        oldDistrict: 'Huyện Châu Thành',
        wards: [
          ['Thị trấn Tân Hiệp', '28519'],
          ['Xã Bàn Long', '28576'],
          ['Xã Bình Đức', '28582'],
          ['Xã Bình Trưng', '28564'],
          ['Xã Điềm Hy', '28564'],
          ['Xã Đông Hòa', '28543'],
          ['Xã Kim Sơn', '28582'],
          ['Xã Long An', '28519'],
          ['Xã Long Định', '28543'],
          ['Xã Long Hưng', '28537'],
          ['Xã Nhị Bình', '28543'],
          ['Xã Phú Phong', '28576'],
          ['Xã Song Thuận', '28582'],
          ['Xã Tam Hiệp', '28537'],
          ['Xã Tân Hội Đông', '28525'],
          ['Xã Tân Hương', '28525'],
          ['Xã Tân Lý Đông', '28525'],
          ['Xã Thạnh Phú', '28537'],
          ['Xã Thân Cửu Nghĩa', '28519'],
          ['Xã Vĩnh Kim', '28576']
        ]
      },
      {
        oldDistrict: 'Huyện Chợ Gạo',
        wards: [
          ['Thị trấn Chợ Gạo', '28594'],
          ['Xã An Thạnh Thủy', '28633'],
          ['Xã Bình Ninh', '28648'],
          ['Xã Bình Phan', '28633'],
          ['Xã Bình Phục Nhứt', '28633'],
          ['Xã Đăng Hưng Phước', '28627'],
          ['Xã Hòa Định', '28648'],
          ['Xã Hòa Tịnh', '28603'],
          ['Xã Long Bình Điền', '28594'],
          ['Xã Lương Hòa Lạc', '28615'],
          ['Xã Mỹ Tịnh An', '28603'],
          ['Xã Phú Kiết', '28615'],
          ['Xã Quơn Long', '28627'],
          ['Xã Song Bình', '28594'],
          ['Xã Tân Bình Thạnh', '28603'],
          ['Xã Tân Thuận Bình', '28627'],
          ['Xã Thanh Bình', '28615'],
          ['Xã Trung Hòa', '28603'],
          ['Xã Xuân Đông', '28648']
        ]
      },
      {
        oldDistrict: 'Huyện Gò Công Đông',
        wards: [
          ['Thị trấn Tân Hòa', '28702'],
          ['Thị trấn Vàm Láng', '28720'],
          ['Xã Bình Ân', '28738'],
          ['Xã Bình Nghị', '28702'],
          ['Xã Gia Thuận', '28720'],
          ['Xã Kiểng Phước', '28720'],
          ['Xã Phước Trung', '28702'],
          ['Xã Tăng Hoà', '28747'],
          ['Xã Tân Điền', '28738'],
          ['Xã Tân Đông', '28723'],
          ['Xã Tân Phước', '28723'],
          ['Xã Tân Tây', '28723'],
          ['Xã Tân Thành', '28747']
        ]
      },
      {
        oldDistrict: 'Huyện Gò Công Tây',
        wards: [
          ['Thị trấn Vĩnh Bình', '28651'],
          ['Xã Bình Nhì', '28660'],
          ['Xã Bình Phú', '28663'],
          ['Xã Bình Tân', '28687'],
          ['Xã Đồng Sơn', '28660'],
          ['Xã Đồng Thạnh', '28660'],
          ['Xã Long Bình', '28687'],
          ['Xã Long Vĩnh', '28678'],
          ['Xã Thành Công', '28663'],
          ['Xã Thạnh Nhựt', '28651'],
          ['Xã Thạnh Trị', '28651'],
          ['Xã Vĩnh Hựu', '28678'],
          ['Xã Yên Luông', '28663']
        ]
      },
      {
        oldDistrict: 'Huyện Tân Phú Đông',
        wards: [
          ['Xã Phú Đông', '28696'],
          ['Xã Phú Tân', '28696'],
          ['Xã Phú Thạnh', '28696'],
          ['Xã Tân Phú', '28693'],
          ['Xã Tân Thạnh', '28693'],
          ['Xã Tân Thới', '28693']
        ]
      },
      {
        oldDistrict: 'Huyện Tân Phước',
        wards: [
          ['Thị trấn Mỹ Phước', '28321'],
          ['Xã Hưng Thạnh', '28336'],
          ['Xã Phú Mỹ', '28336'],
          ['Xã Phước Lập', '28345'],
          ['Xã Tân Hòa Đông', '28321'],
          ['Xã Tân Hòa Tây', '28327'],
          ['Xã Tân Hòa Thành', '28336'],
          ['Xã Tân Lập 1', '28345'],
          ['Xã Tân Lập 2', '28345'],
          ['Xã Thạnh Hoà', '28327'],
          ['Xã Thạnh Mỹ', '28321'],
          ['Xã Thạnh Tân', '28327']
        ]
      },
      {
        oldDistrict: 'Thành phố Gò Công',
        wards: [
          ['Phường 1', '28306'],
          ['Phường 2', '28297'],
          ['Phường 5', '28306'],
          ['Phường Long Chánh', '28315'],
          ['Phường Long Hòa', '28306'],
          ['Phường Long Hưng', '28729'],
          ['Phường Long Thuận', '28297'],
          ['Xã Bình Đông', '28729'],
          ['Xã Bình Xuân', '28315'],
          ['Xã Tân Trung', '28729']
        ]
      },
      {
        oldDistrict: 'Thành phố Mỹ Tho',
        wards: [
          ['Phường 1', '28261'],
          ['Phường 2', '28261'],
          ['Phường 4', '28249'],
          ['Phường 5', '28249'],
          ['Phường 6', '28270'],
          ['Phường 9', '28273'],
          ['Phường 10', '28285'],
          ['Phường Tân Long', '28261'],
          ['Xã Đạo Thạnh', '28249'],
          ['Xã Mỹ Phong', '28273'],
          ['Xã Phước Thạnh', '28285'],
          ['Xã Tân Mỹ Chánh', '28273'],
          ['Xã Thới Sơn', '28270'],
          ['Xã Trung An', '28285']
        ]
      },
      {
        oldDistrict: 'Thị xã Cai Lậy',
        wards: [
          ['Phường 1', '28435'],
          ['Phường 2', '28436'],
          ['Phường 3', '28435'],
          ['Phường 4', '28439'],
          ['Phường 5', '28439'],
          ['Phường Nhị Mỹ', '28477'],
          ['Xã Long Khánh', '28439'],
          ['Xã Mỹ Hạnh Đông', '28468'],
          ['Xã Mỹ Hạnh Trung', '28435'],
          ['Xã Mỹ Phước Tây', '28435'],
          ['Xã Nhị Quý', '28477'],
          ['Xã Phú Quý', '28477'],
          ['Xã Tân Bình', '28436'],
          ['Xã Tân Hội', '28468'],
          ['Xã Tân Phú', '28468'],
          ['Xã Thanh Hòa', '28436']
        ]
      }
    ]
  },
  {
    oldProvince: 'Thành phố Hồ Chí Minh',
    districts: [
      {
        oldDistrict: 'Huyện Bình Chánh',
        wards: [
          ['Thị trấn Tân Túc', '27595'],
          ['Xã An Phú Tây', '27637'],
          ['Xã Bình Chánh', '27637'],
          ['Xã Bình Hưng', '27619'],
          ['Xã Bình Lợi', '27610'],
          ['Xã Đa Phước', '27628'],
          ['Xã Hưng Long', '27628'],
          ['Xã Lê Minh Xuân', '27610'],
          ['Xã Phạm Văn Hai', '27604'],
          ['Xã Phong Phú', '27619'],
          ['Xã Quy Đức', '27628'],
          ['Xã Tân Kiên', '27595'],
          ['Xã Tân Nhựt', '27595'],
          ['Xã Tân Quý Tây', '27637'],
          ['Xã Vĩnh Lộc A', '27601'],
          ['Xã Vĩnh Lộc B', '27604']
        ]
      },
      {
        oldDistrict: 'Huyện Cần Giờ',
        wards: [
          ['Thị trấn Cần Thạnh', '27664'],
          ['Xã An Thới Đông', '27673'],
          ['Xã Bình Khánh', '27667'],
          ['Xã Long Hòa', '27664'],
          ['Xã Lý Nhơn', '27673'],
          ['Xã Tam Thôn Hiệp', '27667'],
          ['Xã Thạnh An', '27676']
        ]
      },
      {
        oldDistrict: 'Huyện Củ Chi',
        wards: [
          ['Thị trấn Củ Chi', '27496'],
          ['Xã An Nhơn Tây', '27508'],
          ['Xã An Phú', '27508'],
          ['Xã Bình Mỹ', '27544'],
          ['Xã Hòa Phú', '27544'],
          ['Xã Nhuận Đức', '27511'],
          ['Xã Phạm Văn Cội', '27511'],
          ['Xã Phú Hòa Đông', '27541'],
          ['Xã Phú Mỹ Hưng', '27508'],
          ['Xã Phước Hiệp', '27496'],
          ['Xã Phước Thạnh', '27526'],
          ['Xã Phước Vĩnh An', '27553'],
          ['Xã Tân An Hội', '27496'],
          ['Xã Tân Phú Trung', '27553'],
          ['Xã Tân Thạnh Đông', '27541'],
          ['Xã Tân Thạnh Tây', '27541'],
          ['Xã Tân Thông Hội', '27553'],
          ['Xã Thái Mỹ', '27526'],
          ['Xã Trung An', '27544'],
          ['Xã Trung Lập Hạ', '27511'],
          ['Xã Trung Lập Thượng', '27526']
        ]
      },
      {
        oldDistrict: 'Huyện Hóc Môn',
        wards: [
          ['Thị trấn Hóc Môn', '27559'],
          ['Xã Bà Điểm', '27592'],
          ['Xã Đông Thạnh', '27568'],
          ['Xã Nhị Bình', '27568'],
          ['Xã Tân Hiệp', '27559'],
          ['Xã Tân Thới Nhì', '27577'],
          ['Xã Tân Xuân', '27559'],
          ['Xã Thới Tam Thôn', '27568'],
          ['Xã Trung Chánh', '27592'],
          ['Xã Xuân Thới Đông', '27577'],
          ['Xã Xuân Thới Sơn', '27577'],
          ['Xã Xuân Thới Thượng', '27592']
        ]
      },
      {
        oldDistrict: 'Huyện Nhà Bè',
        wards: [
          ['Thị trấn Nhà Bè', '27655'],
          ['Xã Hiệp Phước', '27658'],
          ['Xã Long Thới', '27658'],
          ['Xã Nhơn Đức', '27658'],
          ['Xã Phú Xuân', '27655'],
          ['Xã Phước Kiển', '27655'],
          ['Xã Phước Lộc', '27655']
        ]
      },
      {
        oldDistrict: 'Quận 1',
        wards: [
          ['Phường Bến Nghé', '26740'],
          ['Phường Bến Thành', '26743'],
          ['Phường Cầu Kho', '26758'],
          ['Phường Cầu Ông Lãnh', '26758'],
          ['Phường Cô Giang', '26758'],
          ['Phường Đa Kao', '26737'],
          ['Phường Nguyễn Cư Trinh', '26758'],
          ['Phường Nguyễn Thái Bình', '26743'],
          ['Phường Phạm Ngũ Lão', '26743'],
          ['Phường Tân Định', '26737']
        ]
      },
      {
        oldDistrict: 'Quận 3',
        wards: [
          ['Phường 1', '27154'],
          ['Phường 2', '27154'],
          ['Phường 3', '27154'],
          ['Phường 4', '27154'],
          ['Phường 5', '27154'],
          ['Phường 9', '27142'],
          ['Phường 11', '27142'],
          ['Phường 12', '27142'],
          ['Phường 14', '27142'],
          ['Phường Võ Thị Sáu', '27139']
        ]
      },
      {
        oldDistrict: 'Quận 4',
        wards: [
          ['Phường 1', '27286'],
          ['Phường 2', '27286'],
          ['Phường 3', '27286'],
          ['Phường 4', '27286'],
          ['Phường 8', '27265'],
          ['Phường 9', '27265'],
          ['Phường 13', '27259'],
          ['Phường 15', '27265'],
          ['Phường 16', '27259'],
          ['Phường 18', '27259']
        ]
      },
      {
        oldDistrict: 'Quận 5',
        wards: [
          ['Phường 1', '27301'],
          ['Phường 2', '27301'],
          ['Phường 4', '27301'],
          ['Phường 5', '27316'],
          ['Phường 7', '27316'],
          ['Phường 9', '27316'],
          ['Phường 11', '27343'],
          ['Phường 12', '27343'],
          ['Phường 13', '27343'],
          ['Phường 14', '27343']
        ]
      },
      {
        oldDistrict: 'Quận 6',
        wards: [
          ['Phường 1', '27373'],
          ['Phường 2', '27367'],
          ['Phường 7', '27373'],
          ['Phường 8', '27373'],
          ['Phường 9', '27367'],
          ['Phường 10', '27364'],
          ['Phường 11', '27364'],
          ['Phường 12', '27349'],
          ['Phường 13', '27349'],
          ['Phường 14', '27349']
        ]
      },
      {
        oldDistrict: 'Quận 7',
        wards: [
          ['Phường Bình Thuận', '27478'],
          ['Phường Phú Mỹ', '27487'],
          ['Phường Phú Thuận', '27484'],
          ['Phường Tân Hưng', '27475'],
          ['Phường Tân Kiểng', '27475'],
          ['Phường Tân Phong', '27475'],
          ['Phường Tân Phú', '27487'],
          ['Phường Tân Quy', '27475'],
          ['Phường Tân Thuận Đông', '27478'],
          ['Phường Tân Thuận Tây', '27478']
        ]
      },
      {
        oldDistrict: 'Quận 8',
        wards: [
          ['Phường 4', '27418'],
          ['Phường 5', '27418'],
          ['Phường 6', '27424'],
          ['Phường 7', '27424'],
          ['Phường 14', '27427'],
          ['Phường 15', '27427'],
          ['Phường 16', '27427'],
          ['Phường Hưng Phú', '27418'],
          ['Phường Rạch Ông', '27418'],
          ['Phường Xóm Củi', '27427']
        ]
      },
      {
        oldDistrict: 'Quận 10',
        wards: [
          ['Phường 1', '27190'],
          ['Phường 2', '27190'],
          ['Phường 4', '27190'],
          ['Phường 6', '27169'],
          ['Phường 8', '27169'],
          ['Phường 9', '27190'],
          ['Phường 10', '27190'],
          ['Phường 12', '27163'],
          ['Phường 13', '27163'],
          ['Phường 14', '27169'],
          ['Phường 15', '27163']
        ]
      },
      {
        oldDistrict: 'Quận 11',
        wards: [
          ['Phường 1', '27238'],
          ['Phường 3', '27232'],
          ['Phường 5', '27211'],
          ['Phường 7', '27238'],
          ['Phường 8', '27232'],
          ['Phường 10', '27232'],
          ['Phường 11', '27226'],
          ['Phường 14', '27211'],
          ['Phường 15', '27226'],
          ['Phường 16', '27238']
        ]
      },
      {
        oldDistrict: 'Quận 12',
        wards: [
          ['Phường An Phú Đông', '26767'],
          ['Phường Đông Hưng Thuận', '26791'],
          ['Phường Hiệp Thành', '26782'],
          ['Phường Tân Chánh Hiệp', '26785'],
          ['Phường Tân Hưng Thuận', '26791'],
          ['Phường Tân Thới Hiệp', '26782'],
          ['Phường Tân Thới Nhất', '26791'],
          ['Phường Thạnh Lộc', '26767'],
          ['Phường Thạnh Xuân', '26773'],
          ['Phường Thới An', '26773'],
          ['Phường Trung Mỹ Tây', '26785']
        ]
      },
      {
        oldDistrict: 'Quận Bình Tân',
        wards: [
          ['Phường An Lạc', '27460'],
          ['Phường An Lạc A', '27460'],
          ['Phường Bình Hưng Hòa', '27439'],
          ['Phường Bình Hưng Hoà A', '27439'],
          ['Phường Bình Hưng Hoà B', '27442'],
          ['Phường Bình Trị Đông', '27448'],
          ['Phường Bình Trị Đông A', '27448'],
          ['Phường Bình Trị Đông B', '27460'],
          ['Phường Tân Tạo', '27457'],
          ['Phường Tân Tạo A', '27457']
        ]
      },
      {
        oldDistrict: 'Quận Bình Thạnh',
        wards: [
          ['Phường 1', '26944'],
          ['Phường 2', '26944'],
          ['Phường 5', '26905'],
          ['Phường 7', '26944'],
          ['Phường 11', '26905'],
          ['Phường 12', '26929'],
          ['Phường 13', '26905'],
          ['Phường 14', '26929'],
          ['Phường 17', '26944'],
          ['Phường 19', '26956'],
          ['Phường 22', '26956'],
          ['Phường 25', '26956'],
          ['Phường 26', '26929'],
          ['Phường 27', '26911'],
          ['Phường 28', '26911']
        ]
      },
      {
        oldDistrict: 'Quận Gò Vấp',
        wards: [
          ['Phường 1', '26890'],
          ['Phường 3', '26890'],
          ['Phường 5', '26876'],
          ['Phường 6', '26876'],
          ['Phường 8', '26898'],
          ['Phường 10', '26884'],
          ['Phường 11', '26898'],
          ['Phường 12', '26882'],
          ['Phường 14', '26882'],
          ['Phường 15', '26878'],
          ['Phường 16', '26878'],
          ['Phường 17', '26884']
        ]
      },
      {
        oldDistrict: 'Quận Phú Nhuận',
        wards: [
          ['Phường 1', '27058'],
          ['Phường 2', '27058'],
          ['Phường 4', '27043'],
          ['Phường 5', '27043'],
          ['Phường 7', '27058'],
          ['Phường 8', '27073'],
          ['Phường 9', '27043'],
          ['Phường 10', '27073'],
          ['Phường 11', '27073'],
          ['Phường 13', '27073'],
          ['Phường 15', '27058']
        ]
      },
      {
        oldDistrict: 'Quận Tân Bình',
        wards: [
          ['Phường 1', '26977'],
          ['Phường 2', '26977'],
          ['Phường 3', '26977'],
          ['Phường 4', '26968'],
          ['Phường 5', '26968'],
          ['Phường 6', '26995'],
          ['Phường 7', '26968'],
          ['Phường 8', '26995'],
          ['Phường 9', '26995'],
          ['Phường 10', '26983'],
          ['Phường 11', '26983'],
          ['Phường 12', '26983'],
          ['Phường 13', '27004'],
          ['Phường 14', '27004'],
          ['Phường 15', '27007']
        ]
      },
      {
        oldDistrict: 'Quận Tân Phú',
        wards: [
          ['Phường Hiệp Tân', '27028'],
          ['Phường Hòa Thạnh', '27031'],
          ['Phường Phú Thạnh', '27028'],
          ['Phường Phú Thọ Hòa', '27022'],
          ['Phường Phú Trung', '27031'],
          ['Phường Sơn Kỳ', '27019'],
          ['Phường Tân Quý', '27019'],
          ['Phường Tân Sơn Nhì', '27019'],
          ['Phường Tân Thành', '27022'],
          ['Phường Tân Thới Hòa', '27028'],
          ['Phường Tây Thạnh', '27013']
        ]
      },
      {
        oldDistrict: 'Thành phố Thủ Đức',
        wards: [
          ['Phường An Khánh', '27094'],
          ['Phường An Lợi Đông', '27094'],
          ['Phường An Phú', '27097'],
          ['Phường Bình Chiểu', '26803'],
          ['Phường Bình Thọ', '26824'],
          ['Phường Bình Trưng Đông', '27097'],
          ['Phường Bình Trưng Tây', '27097'],
          ['Phường Cát Lái', '27112'],
          ['Phường Hiệp Bình Chánh', '26809'],
          ['Phường Hiệp Bình Phước', '26809'],
          ['Phường Hiệp Phú', '26842'],
          ['Phường Linh Chiểu', '26824'],
          ['Phường Linh Đông', '26809'],
          ['Phường Linh Tây', '26800'],
          ['Phường Linh Trung', '26800'],
          ['Phường Linh Xuân', '26800'],
          ['Phường Long Bình', '26833'],
          ['Phường Long Phước', '26857'],
          ['Phường Long Thạnh Mỹ', '26833'],
          ['Phường Long Trường', '26860'],
          ['Phường Phú Hữu', '26860'],
          ['Phường Phước Bình', '26848'],
          ['Phường Phước Long A', '26848'],
          ['Phường Phước Long B', '26848'],
          ['Phường Tam Bình', '26803'],
          ['Phường Tam Phú', '26803'],
          ['Phường Tăng Nhơn Phú A', '26842'],
          ['Phường Tăng Nhơn Phú B', '26842'],
          ['Phường Tân Phú', '26842'],
          ['Phường Thạnh Mỹ Lợi', '27112'],
          ['Phường Thảo Điền', '27094'],
          ['Phường Thủ Thiêm', '27094'],
          ['Phường Trường Thạnh', '26857'],
          ['Phường Trường Thọ', '26824']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Trà Vinh',
    districts: [
      {
        oldDistrict: 'Huyện Càng Long',
        wards: [
          ['Thị trấn Càng Long', '29266'],
          ['Xã An Trường', '29275'],
          ['Xã An Trường A', '29275'],
          ['Xã Bình Phú', '29287'],
          ['Xã Đại Phúc', '29287'],
          ['Xã Đại Phước', '29302'],
          ['Xã Đức Mỹ', '29302'],
          ['Xã Huyền Hội', '29278'],
          ['Xã Mỹ Cẩm', '29266'],
          ['Xã Nhị Long', '29302'],
          ['Xã Nhị Long Phú', '29266'],
          ['Xã Phương Thạnh', '29287'],
          ['Xã Tân An', '29278'],
          ['Xã Tân Bình', '29275']
        ]
      },
      {
        oldDistrict: 'Huyện Cầu Kè',
        wards: [
          ['Thị trấn Cầu Kè', '29308'],
          ['Xã An Phú Tân', '29317'],
          ['Xã Châu Điền', '29308'],
          ['Xã Hòa Ân', '29308'],
          ['Xã Hoà Tân', '29317'],
          ['Xã Ninh Thới', '29329'],
          ['Xã Phong Phú', '29329'],
          ['Xã Phong Thạnh', '29329'],
          ['Xã Tam Ngãi', '29335'],
          ['Xã Thạnh Phú', '29335'],
          ['Xã Thông Hòa', '29335']
        ]
      },
      {
        oldDistrict: 'Huyện Cầu Ngang',
        wards: [
          ['Thị trấn Cầu Ngang', '29416'],
          ['Thị trấn Mỹ Long', '29419'],
          ['Xã Hiệp Hòa', '29446'],
          ['Xã Hiệp Mỹ Đông', '29455'],
          ['Xã Hiệp Mỹ Tây', '29455'],
          ['Xã Kim Hòa', '29431'],
          ['Xã Long Sơn', '29455'],
          ['Xã Mỹ Hòa', '29416'],
          ['Xã Mỹ Long Bắc', '29419'],
          ['Xã Mỹ Long Nam', '29419'],
          ['Xã Nhị Trường', '29446'],
          ['Xã Thạnh Hòa Sơn', '29530'],
          ['Xã Thuận Hòa', '29416'],
          ['Xã Trường Thọ', '29446'],
          ['Xã Vĩnh Kim', '29431']
        ]
      },
      {
        oldDistrict: 'Huyện Châu Thành',
        wards: [
          ['Thị trấn Châu Thành', '29374'],
          ['Xã Đa Lộc', '29374'],
          ['Xã Hòa Lợi', '29407'],
          ['Xã Hòa Minh', '29410'],
          ['Xã Hòa Thuận', '29398'],
          ['Xã Hưng Mỹ', '29407'],
          ['Xã Long Hòa', '29413'],
          ['Xã Lương Hòa', '29386'],
          ['Xã Lương Hoà A', '29386'],
          ['Xã Mỹ Chánh', '29374'],
          ['Xã Nguyệt Hóa', '29254'],
          ['Xã Phước Hảo', '29407'],
          ['Xã Song Lộc', '29386'],
          ['Xã Thanh Mỹ', '29374']
        ]
      },
      {
        oldDistrict: 'Huyện Duyên Hải',
        wards: [
          ['Thị trấn Long Thành', '29513'],
          ['Xã Đôn Châu', '29497'],
          ['Xã Đôn Xuân', '29497'],
          ['Xã Đông Hải', '29536'],
          ['Xã Long Khánh', '29513'],
          ['Xã Long Vĩnh', '29533'],
          ['Xã Ngũ Lạc', '29530']
        ]
      },
      {
        oldDistrict: 'Huyện Tiểu Cần',
        wards: [
          ['Thị trấn Cầu Quan', '29371'],
          ['Thị trấn Tiểu Cần', '29341'],
          ['Xã Hiếu Trung', '29341'],
          ['Xã Hiếu Tử', '29365'],
          ['Xã Hùng Hòa', '29362'],
          ['Xã Long Thới', '29371'],
          ['Xã Ngãi Hùng', '29362'],
          ['Xã Phú Cần', '29341'],
          ['Xã Tân Hòa', '29371'],
          ['Xã Tân Hùng', '29362'],
          ['Xã Tập Ngãi', '29365']
        ]
      },
      {
        oldDistrict: 'Huyện Trà Cú',
        wards: [
          ['Thị trấn Định An', '29491'],
          ['Thị trấn Trà Cú', '29461'],
          ['Xã An Quảng Hữu', '29476'],
          ['Xã Đại An', '29491'],
          ['Xã Định An', '29491'],
          ['Xã Hàm Giang', '29489'],
          ['Xã Hàm Tân', '29489'],
          ['Xã Kim Sơn', '29489'],
          ['Xã Long Hiệp', '29506'],
          ['Xã Lưu Nghiệp Anh', '29476'],
          ['Xã Ngãi Xuyên', '29461'],
          ['Xã Ngọc Biên', '29506'],
          ['Xã Phước Hưng', '29467'],
          ['Xã Tân Hiệp', '29506'],
          ['Xã Tân Sơn', '29467'],
          ['Xã Tập Sơn', '29467'],
          ['Xã Thanh Sơn', '29461']
        ]
      },
      {
        oldDistrict: 'Thành phố Trà Vinh',
        wards: [
          ['Phường 1', '29242'],
          ['Phường 3', '29242'],
          ['Phường 4', '29263'],
          ['Phường 5', '29398'],
          ['Phường 7', '29254'],
          ['Phường 8', '29254'],
          ['Phường 9', '29242'],
          ['Xã Long Đức', '29263']
        ]
      },
      {
        oldDistrict: 'Thị xã Duyên Hải',
        wards: [
          ['Phường 1', '29512'],
          ['Phường 2', '29516'],
          ['Xã Dân Thành', '29512'],
          ['Xã Hiệp Thạnh', '29518'],
          ['Xã Long Hữu', '29518'],
          ['Xã Long Toàn', '29512'],
          ['Xã Trường Long Hòa', '29516']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Tuyên Quang',
    districts: [
      {
        oldDistrict: 'Huyện Chiêm Hóa',
        wards: [
          ['Thị trấn Vĩnh Lộc', '02287'],
          ['Xã Bình Nhân', '02350'],
          ['Xã Bình Phú', '02317'],
          ['Xã Hà Lang', '02320'],
          ['Xã Hòa An', '02353'],
          ['Xã Hòa Phú', '02365'],
          ['Xã Hùng Mỹ', '02308'],
          ['Xã Kiên Đài', '02332'],
          ['Xã Kim Bình', '02350'],
          ['Xã Linh Phú', '02359'],
          ['Xã Ngọc Hội', '02287'],
          ['Xã Nhân Lý', '02353'],
          ['Xã Phú Bình', '02332'],
          ['Xã Phúc Thịnh', '02287'],
          ['Xã Tân An', '02320'],
          ['Xã Tân Mỹ', '02308'],
          ['Xã Tân Thịnh', '02353'],
          ['Xã Tri Phú', '02359'],
          ['Xã Trung Hà', '02305'],
          ['Xã Trung Hòa', '02287'],
          ['Xã Vinh Quang', '02350'],
          ['Xã Xuân Quang', '02287'],
          ['Xã Yên Lập', '02317'],
          ['Xã Yên Nguyên', '02365']
        ]
      },
      {
        oldDistrict: 'Huyện Hàm Yên',
        wards: [
          ['Thị trấn Tân Yên', '02374'],
          ['Xã Bạch Xa', '02380'],
          ['Xã Bằng Cốc', '02374'],
          ['Xã Bình Xa', '02404'],
          ['Xã Đức Ninh', '02419'],
          ['Xã Hùng Đức', '02425'],
          ['Xã Minh Dân', '02392'],
          ['Xã Minh Hương', '02404'],
          ['Xã Minh Khương', '02380'],
          ['Xã Nhân Mục', '02374'],
          ['Xã Phù Lưu', '02392'],
          ['Xã Tân Thành', '02374'],
          ['Xã Thái Hòa', '02419'],
          ['Xã Thái Sơn', '02407'],
          ['Xã Thành Long', '02407'],
          ['Xã Yên Lâm', '02398'],
          ['Xã Yên Phú', '02398'],
          ['Xã Yên Thuận', '02380']
        ]
      },
      {
        oldDistrict: 'Huyện Lâm Bình',
        wards: [
          ['Thị trấn Lăng Can', '02266'],
          ['Xã Bình An', '02296'],
          ['Xã Hồng Quang', '02302'],
          ['Xã Khuôn Hà', '02269'],
          ['Xã Minh Quang', '02302'],
          ['Xã Phúc Sơn', '02302'],
          ['Xã Phúc Yên', '02266'],
          ['Xã Thổ Bình', '02296'],
          ['Xã Thượng Lâm', '02269'],
          ['Xã Xuân Lập', '02266']
        ]
      },
      {
        oldDistrict: 'Huyện Na Hang',
        wards: [
          ['Thị trấn Na Hang', '02221'],
          ['Xã Côn Lôn', '02245'],
          ['Xã Đà Vị', '02260'],
          ['Xã Hồng Thái', '02260'],
          ['Xã Khau Tinh', '02248'],
          ['Xã Năng Khả', '02221'],
          ['Xã Sinh Long', '02245'],
          ['Xã Sơn Phú', '02260'],
          ['Xã Thanh Tương', '02221'],
          ['Xã Thượng Giáp', '02239'],
          ['Xã Thượng Nông', '02239'],
          ['Xã Yên Hoa', '02248']
        ]
      },
      {
        oldDistrict: 'Huyện Sơn Dương',
        wards: [
          ['Thị trấn Sơn Dương', '02536'],
          ['Xã Bình Yên', '02554'],
          ['Xã Cấp Tiến', '02548'],
          ['Xã Chi Thiết', '02608'],
          ['Xã Đại Phú', '02611'],
          ['Xã Đông Lợi', '02623'],
          ['Xã Đồng Quý', '02572'],
          ['Xã Đông Thọ', '02572'],
          ['Xã Hào Phú', '02623'],
          ['Xã Hồng Sơn', '02608'],
          ['Xã Hợp Hòa', '02578'],
          ['Xã Hợp Thành', '02536'],
          ['Xã Kháng Nhật', '02578'],
          ['Xã Lương Thiện', '02554'],
          ['Xã Minh Thanh', '02554'],
          ['Xã Ninh Lai', '02620'],
          ['Xã Phú Lương', '02611'],
          ['Xã Phúc Ứng', '02536'],
          ['Xã Quyết Thắng', '02572'],
          ['Xã Sơn Nam', '02620'],
          ['Xã Tam Đa', '02611'],
          ['Xã Tân Thanh', '02578'],
          ['Xã Tân Trào', '02545'],
          ['Xã Thiện Kế', '02620'],
          ['Xã Thượng Ấm', '02548'],
          ['Xã Trung Yên', '02545'],
          ['Xã Trường Sinh', '02623'],
          ['Xã Tú Thịnh', '02536'],
          ['Xã Văn Phú', '02608'],
          ['Xã Vĩnh Lợi', '02548']
        ]
      },
      {
        oldDistrict: 'Huyện Yên Sơn',
        wards: [
          ['Thị trấn Yên Sơn', '02473'],
          ['Xã Chân Sơn', '02473'],
          ['Xã Chiêu Yên', '02434'],
          ['Xã Công Đa', '02458'],
          ['Xã Đạo Viện', '02458'],
          ['Xã Đội Bình', '02530'],
          ['Xã Hoàng Khai', '02512'],
          ['Xã Hùng Lợi', '02455'],
          ['Xã Kiến Thiết', '02437'],
          ['Xã Kim Quan', '02545'],
          ['Xã Lang Quán', '02473'],
          ['Xã Lực Hành', '02434'],
          ['Xã Mỹ Bằng', '02509'],
          ['Xã Nhữ Hán', '02530'],
          ['Xã Nhữ Khê', '02530'],
          ['Xã Phú Thịnh', '02494'],
          ['Xã Phúc Ninh', '02449'],
          ['Xã Quí Quân', '02434'],
          ['Xã Tân Long', '02470'],
          ['Xã Tân Tiến', '02470'],
          ['Xã Thái Bình', '02494'],
          ['Xã Tiến Bộ', '02494'],
          ['Xã Trung Minh', '02455'],
          ['Xã Trung Môn', '02215'],
          ['Xã Trung Sơn', '02458'],
          ['Xã Trung Trực', '02449'],
          ['Xã Tứ Quận', '02473'],
          ['Xã Xuân Vân', '02449']
        ]
      },
      {
        oldDistrict: 'Thành phố Tuyên Quang',
        wards: [
          ['Phường An Tường', '02512'],
          ['Phường Đội Cấn', '02524'],
          ['Phường Hưng Thành', '02512'],
          ['Phường Minh Xuân', '02215'],
          ['Phường Mỹ Lâm', '02509'],
          ['Phường Nông Tiến', '02212'],
          ['Phường Phan Thiết', '02215'],
          ['Phường Tân Hà', '02215'],
          ['Phường Tân Quang', '02215'],
          ['Phường Ỷ La', '02215'],
          ['Xã An Khang', '02512'],
          ['Xã Kim Phú', '02509'],
          ['Xã Lưỡng Vượng', '02512'],
          ['Xã Thái Long', '02524'],
          ['Xã Tràng Đà', '02212']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Vĩnh Long',
    districts: [
      {
        oldDistrict: 'Huyện Bình Tân',
        wards: [
          ['Thị trấn Tân Quới', '29800'],
          ['Xã Mỹ Thuận', '29788'],
          ['Xã Nguyễn Văn Thảnh', '29788'],
          ['Xã Tân An Thạnh', '29785'],
          ['Xã Tân Bình', '29800'],
          ['Xã Tân Lược', '29785'],
          ['Xã Tân Thành', '29785'],
          ['Xã Thành Lợi', '29800'],
          ['Xã Thành Trung', '29788']
        ]
      },
      {
        oldDistrict: 'Huyện Long Hồ',
        wards: [
          ['Thị trấn Long Hồ', '29602'],
          ['Xã An Bình', '29584'],
          ['Xã Bình Hòa Phước', '29584'],
          ['Xã Đồng Phú', '29584'],
          ['Xã Hòa Ninh', '29584'],
          ['Xã Hòa Phú', '29611'],
          ['Xã Long An', '29602'],
          ['Xã Long Phước', '29602'],
          ['Xã Lộc Hòa', '29611'],
          ['Xã Phú Quới', '29611'],
          ['Xã Phước Hậu', '29557'],
          ['Xã Tân Hạnh', '29593'],
          ['Xã Thanh Đức', '29590'],
          ['Xã Thạnh Quới', '29611']
        ]
      },
      {
        oldDistrict: 'Huyện Mang Thít',
        wards: [
          ['Thị trấn Cái Nhum', '29641'],
          ['Xã An Phước', '29641'],
          ['Xã Bình Phước', '29638'],
          ['Xã Chánh An', '29641'],
          ['Xã Hòa Tịnh', '29638'],
          ['Xã Long Mỹ', '29638'],
          ['Xã Mỹ An', '29623'],
          ['Xã Mỹ Phước', '29623'],
          ['Xã Nhơn Phú', '29623'],
          ['Xã Tân An Hội', '29653'],
          ['Xã Tân Long', '29653'],
          ['Xã Tân Long Hội', '29653']
        ]
      },
      {
        oldDistrict: 'Huyện Tam Bình',
        wards: [
          ['Thị trấn Tam Bình', '29719'],
          ['Xã Bình Ninh', '29767'],
          ['Xã Hậu Lộc', '29728'],
          ['Xã Hòa Hiệp', '29734'],
          ['Xã Hoà Lộc', '29734'],
          ['Xã Hòa Thạnh', '29734'],
          ['Xã Loan Mỹ', '29767'],
          ['Xã Long Phú', '29740'],
          ['Xã Mỹ Lộc', '29728'],
          ['Xã Mỹ Thạnh Trung', '29719'],
          ['Xã Ngãi Tứ', '29767'],
          ['Xã Phú Lộc', '29728'],
          ['Xã Phú Thịnh', '29740'],
          ['Xã Song Phú', '29740'],
          ['Xã Tân Lộc', '29728'],
          ['Xã Tân Phú', '29740']
        ]
      },
      {
        oldDistrict: 'Huyện Trà Ôn',
        wards: [
          ['Thị trấn Trà Ôn', '29821'],
          ['Xã Hòa Bình', '29830'],
          ['Xã Hựu Thành', '29845'],
          ['Xã Lục Sỹ Thành', '29857'],
          ['Xã Nhơn Bình', '29836'],
          ['Xã Phú Thành', '29857'],
          ['Xã Tân Mỹ', '29836'],
          ['Xã Thới Hòa', '29830'],
          ['Xã Thuận Thới', '29845'],
          ['Xã Tích Thiện', '29821'],
          ['Xã Trà Côn', '29836'],
          ['Xã Vĩnh Xuân', '29845'],
          ['Xã Xuân Hiệp', '29830']
        ]
      },
      {
        oldDistrict: 'Huyện Vũng Liêm',
        wards: [
          ['Thị trấn Vũng Liêm', '29659'],
          ['Xã Hiếu Nghĩa', '29713'],
          ['Xã Hiếu Nhơn', '29713'],
          ['Xã Hiếu Phụng', '29701'],
          ['Xã Hiếu Thành', '29713'],
          ['Xã Hiếu Thuận', '29701'],
          ['Xã Quới An', '29668'],
          ['Xã Quới Thiện', '29677'],
          ['Xã Tân An Luông', '29683'],
          ['Xã Tân Quới Trung', '29668'],
          ['Xã Thanh Bình', '29677'],
          ['Xã Trung An', '29701'],
          ['Xã Trung Chánh', '29683'],
          ['Xã Trung Hiệp', '29683'],
          ['Xã Trung Hiếu', '29659'],
          ['Xã Trung Ngãi', '29698'],
          ['Xã Trung Nghĩa', '29698'],
          ['Xã Trung Thành', '29659'],
          ['Xã Trung Thành Đông', '29698'],
          ['Xã Trung Thành Tây', '29668']
        ]
      },
      {
        oldDistrict: 'Thành phố Vĩnh Long',
        wards: [
          ['Phường 1', '29551'],
          ['Phường 3', '29557'],
          ['Phường 4', '29557'],
          ['Phường 5', '29590'],
          ['Phường 8', '29593'],
          ['Phường 9', '29551'],
          ['Phường Tân Hòa', '29566'],
          ['Phường Tân Hội', '29566'],
          ['Phường Tân Ngãi', '29566'],
          ['Phường Trường An', '29551']
        ]
      },
      {
        oldDistrict: 'Thị xã Bình Minh',
        wards: [
          ['Phường Cái Vồn', '29770'],
          ['Phường Đông Thuận', '29812'],
          ['Phường Thành Phước', '29771'],
          ['Xã Đông Bình', '29812'],
          ['Xã Đông Thành', '29812'],
          ['Xã Đông Thạnh', '29812'],
          ['Xã Mỹ Hòa', '29770'],
          ['Xã Thuận An', '29771']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Vĩnh Phúc',
    districts: [
      {
        oldDistrict: 'Huyện Bình Xuyên',
        wards: [
          ['Thị trấn Bá Hiến', '08944'],
          ['Thị trấn Đạo Đức', '08971'],
          ['Thị trấn Gia Khánh', '08950'],
          ['Thị trấn Hương Canh', '08935'],
          ['Thị trấn Thanh Lãng', '08971'],
          ['Xã Hương Sơn', '08950'],
          ['Xã Phú Xuân', '08971'],
          ['Xã Quất Lưu', '08935'],
          ['Xã Sơn Lôi', '08935'],
          ['Xã Tam Hợp', '08935'],
          ['Xã Tân Phong', '08971'],
          ['Xã Thiện Kế', '08950'],
          ['Xã Trung Mỹ', '08944']
        ]
      },
      {
        oldDistrict: 'Huyện Lập Thạch',
        wards: [
          ['Thị trấn Hoa Sơn', '08812'],
          ['Thị trấn Lập Thạch', '08761'],
          ['Xã Bàn Giản', '08812'],
          ['Xã Bắc Bình', '08788'],
          ['Xã Đồng Ích', '08842'],
          ['Xã Hợp Lý', '08770'],
          ['Xã Liên Hòa', '08812'],
          ['Xã Liễn Sơn', '08788'],
          ['Xã Ngọc Mỹ', '08770'],
          ['Xã Quang Sơn', '08770'],
          ['Xã Sơn Đông', '08866'],
          ['Xã Tây Sơn', '08866'],
          ['Xã Thái Hòa', '08788'],
          ['Xã Tiên Lữ', '08842'],
          ['Xã Tử Du', '08761'],
          ['Xã Văn Quán', '08842'],
          ['Xã Vân Trục', '08761'],
          ['Xã Xuân Hòa', '08761'],
          ['Xã Xuân Lôi', '08842']
        ]
      },
      {
        oldDistrict: 'Huyện Sông Lô',
        wards: [
          ['Thị trấn Tam Sơn', '08824'],
          ['Xã Cao Phong', '08866'],
          ['Xã Đôn Nhân', '08782'],
          ['Xã Đồng Quế', '08824'],
          ['Xã Đồng Thịnh', '08848'],
          ['Xã Đức Bác', '08848'],
          ['Xã Hải Lựu', '08782'],
          ['Xã Lãng Công', '08773'],
          ['Xã Nhân Đạo', '08782'],
          ['Xã Phương Khoan', '08782'],
          ['Xã Quang Yên', '08773'],
          ['Xã Tân Lập', '08824'],
          ['Xã Tứ Yên', '08848'],
          ['Xã Yên Thạch', '08848']
        ]
      },
      {
        oldDistrict: 'Huyện Tam Dương',
        wards: [
          ['Thị trấn Hợp Hòa', '08869'],
          ['Thị trấn Kim Long', '08869'],
          ['Xã An Hòa', '08896'],
          ['Xã Duy Phiên', '08905'],
          ['Xã Đạo Tú', '08869'],
          ['Xã Đồng Tĩnh', '08872'],
          ['Xã Hoàng Đan', '08896'],
          ['Xã Hoàng Hoa', '08872'],
          ['Xã Hoàng Lâu', '08896'],
          ['Xã Hội Thịnh', '08905'],
          ['Xã Hướng Đạo', '08869'],
          ['Xã Thanh Vân', '08905']
        ]
      },
      {
        oldDistrict: 'Huyện Tam Đảo',
        wards: [
          ['Thị trấn Đại Đình', '08923'],
          ['Thị trấn Hợp Châu', '08911'],
          ['Thị trấn Tam Đảo', '08911'],
          ['Xã Bồ Lý', '08923'],
          ['Xã Đạo Trù', '08914'],
          ['Xã Hồ Sơn', '08911'],
          ['Xã Minh Quang', '08911'],
          ['Xã Tam Quan', '08872'],
          ['Xã Yên Dương', '08914']
        ]
      },
      {
        oldDistrict: 'Huyện Vĩnh Tường',
        wards: [
          ['Thị trấn Thổ Tang', '09112'],
          ['Thị trấn Tứ Trưng', '09076'],
          ['Thị trấn Vĩnh Tường', '09076'],
          ['Xã An Nhân', '09154'],
          ['Xã Chấn Hưng', '09079'],
          ['Xã Đại Đồng', '09100'],
          ['Xã Kim Xá', '09079'],
          ['Xã Lũng Hoà', '09106'],
          ['Xã Lương Điền', '09076'],
          ['Xã Nghĩa Hưng', '09100'],
          ['Xã Ngũ Kiên', '09154'],
          ['Xã Sao Đại Việt', '09106'],
          ['Xã Tân Phú', '09106'],
          ['Xã Thượng Trưng', '09112'],
          ['Xã Tuân Chính', '09112'],
          ['Xã Vĩnh Phú', '09154'],
          ['Xã Vĩnh Thịnh', '09154'],
          ['Xã Vũ Di', '09076'],
          ['Xã Yên Bình', '09079'],
          ['Xã Yên Lập', '09100']
        ]
      },
      {
        oldDistrict: 'Huyện Yên Lạc',
        wards: [
          ['Thị trấn Tam Hồng', '09043'],
          ['Thị trấn Yên Lạc', '09025'],
          ['Xã Bình Định', '09025'],
          ['Xã Đại Tự', '09064'],
          ['Xã Đồng Cương', '09025'],
          ['Xã Đồng Văn', '09040'],
          ['Xã Hồng Châu', '09064'],
          ['Xã Liên Châu', '09064'],
          ['Xã Nguyệt Đức', '09052'],
          ['Xã Tề Lỗ', '09040'],
          ['Xã Trung Hà', '09052'],
          ['Xã Trung Kiên', '09052'],
          ['Xã Trung Nguyên', '09040'],
          ['Xã Văn Tiến', '09052'],
          ['Xã Yên Đồng', '09043'],
          ['Xã Yên Phương', '09043']
        ]
      },
      {
        oldDistrict: 'Thành phố Phúc Yên',
        wards: [
          ['Phường Đồng Xuân', '08746'],
          ['Phường Hai Bà Trưng', '08740'],
          ['Phường Hùng Vương', '08740'],
          ['Phường Nam Viêm', '08740'],
          ['Phường Phúc Thắng', '08740'],
          ['Phường Tiền Châu', '08740'],
          ['Phường Xuân Hoà', '08746'],
          ['Xã Cao Minh', '08746'],
          ['Xã Ngọc Thanh', '08746']
        ]
      },
      {
        oldDistrict: 'Thành phố Vĩnh Yên',
        wards: [
          ['Phường Định Trung', '08716'],
          ['Phường Đống Đa', '08716'],
          ['Phường Đồng Tâm', '08707'],
          ['Phường Hội Hợp', '08707'],
          ['Phường Khai Quang', '08716'],
          ['Phường Liên Bảo', '08716'],
          ['Phường Ngô Quyền', '08716'],
          ['Phường Tích Sơn', '08707'],
          ['Xã Thanh Trù', '08707']
        ]
      }
    ]
  },
  {
    oldProvince: 'Tỉnh Yên Bái',
    districts: [
      {
        oldDistrict: 'Huyện Lục Yên',
        wards: [
          ['Thị trấn Yên Thế', '04303'],
          ['Xã An Lạc', '04342'],
          ['Xã An Phú', '04345'],
          ['Xã Động Quan', '04342'],
          ['Xã Khai Trung', '04336'],
          ['Xã Khánh Hoà', '04342'],
          ['Xã Khánh Thiện', '04309'],
          ['Xã Lâm Thượng', '04309'],
          ['Xã Liễu Đô', '04303'],
          ['Xã Mai Sơn', '04309'],
          ['Xã Minh Chuẩn', '04336'],
          ['Xã Minh Tiến', '04345'],
          ['Xã Minh Xuân', '04303'],
          ['Xã Mường Lai', '04345'],
          ['Xã Phan Thanh', '04336'],
          ['Xã Phúc Lợi', '04363'],
          ['Xã Tân Lập', '04336'],
          ['Xã Tân Lĩnh', '04336'],
          ['Xã Tân Phượng', '04309'],
          ['Xã Tô Mậu', '04342'],
          ['Xã Trúc Lâu', '04363'],
          ['Xã Trung Tâm', '04363'],
          ['Xã Vĩnh Lạc', '04345'],
          ['Xã Yên Thắng', '04303']
        ]
      },
      {
        oldDistrict: 'Huyện Mù Căng Chải',
        wards: [
          ['Thị trấn Mù Căng Chải', '04456'],
          ['Xã Cao Phạ', '04630'],
          ['Xã Chế Cu Nha', '04456'],
          ['Xã Chế Tạo', '04489'],
          ['Xã Dế Su Phình', '04492'],
          ['Xã Hồ Bốn', '04465'],
          ['Xã Khao Mang', '04465'],
          ['Xã Kim Nọi', '04456'],
          ['Xã La Pán Tẩn', '04492'],
          ['Xã Lao Chải', '04474'],
          ['Xã Mồ Dề', '04456'],
          ['Xã Nậm Có', '04462'],
          ['Xã Nậm Khắt', '04492'],
          ['Xã Púng Luông', '04492']
        ]
      },
      {
        oldDistrict: 'Huyện Trạm Tấu',
        wards: [
          ['Thị trấn Trạm Tấu', '04585'],
          ['Xã Bản Công', '04585'],
          ['Xã Bản Mù', '04609'],
          ['Xã Hát Lìu', '04585'],
          ['Xã Làng Nhì', '04609'],
          ['Xã Pá Hu', '04606'],
          ['Xã Pá Lau', '04606'],
          ['Xã Phình Hồ', '04609'],
          ['Xã Tà Si Láng', '04603'],
          ['Xã Trạm Tấu', '04606'],
          ['Xã Túc Đán', '04606'],
          ['Xã Xà Hồ', '04585']
        ]
      },
      {
        oldDistrict: 'Huyện Trấn Yên',
        wards: [
          ['Thị trấn Cổ Phúc', '04498'],
          ['Xã Báo Đáp', '04498'],
          ['Xã Cường Thịnh', '04273'],
          ['Xã Hòa Cuông', '04498'],
          ['Xã Hồng Ca', '04576'],
          ['Xã Hưng Khánh', '04576'],
          ['Xã Hưng Thịnh', '04537'],
          ['Xã Kiên Thành', '04531'],
          ['Xã Lương Thịnh', '04537'],
          ['Xã Minh Quán', '04498'],
          ['Xã Minh Quân', '04543'],
          ['Xã Quy Mông', '04531'],
          ['Xã Tân Đồng', '04498'],
          ['Xã Thành Thịnh', '04498'],
          ['Xã Vân Hội', '04564'],
          ['Xã Việt Cường', '04564'],
          ['Xã Việt Hồng', '04564'],
          ['Xã Y Can', '04531']
        ]
      },
      {
        oldDistrict: 'Huyện Văn Chấn',
        wards: [
          ['Thị trấn Liên Sơn', '04660'],
          ['Thị trấn Sơn Thịnh', '04672'],
          ['Thị trấn Trần Phú', '04705'],
          ['Xã An Lương', '04450'],
          ['Xã Bình Thuận', '04711'],
          ['Xã Cát Thịnh', '04693'],
          ['Xã Chấn Thịnh', '04699'],
          ['Xã Đại Lịch', '04699'],
          ['Xã Đồng Khê', '04672'],
          ['Xã Gia Hội', '04636'],
          ['Xã Minh An', '04711'],
          ['Xã Nậm Búng', '04636'],
          ['Xã Nậm Lành', '04636'],
          ['Xã Nậm Mười', '04651'],
          ['Xã Nghĩa Sơn', '04288'],
          ['Xã Nghĩa Tâm', '04711'],
          ['Xã Sơn Lương', '04651'],
          ['Xã Sùng Đô', '04651'],
          ['Xã Suối Bu', '04672'],
          ['Xã Suối Giàng', '04672'],
          ['Xã Suối Quyền', '04651'],
          ['Xã Tân Thịnh', '04699'],
          ['Xã Thượng Bằng La', '04705'],
          ['Xã Tú Lệ', '04630']
        ]
      },
      {
        oldDistrict: 'Huyện Văn Yên',
        wards: [
          ['Thị trấn Mậu A', '04375'],
          ['Xã An Bình', '04399'],
          ['Xã An Thịnh', '04375'],
          ['Xã Châu Quế Hạ', '04387'],
          ['Xã Châu Quế Thượng', '04387'],
          ['Xã Đại Phác', '04441'],
          ['Xã Đại Sơn', '04429'],
          ['Xã Đông An', '04399'],
          ['Xã Đông Cuông', '04399'],
          ['Xã Lang Thíp', '04381'],
          ['Xã Lâm Giang', '04381'],
          ['Xã Mậu Đông', '04375'],
          ['Xã Mỏ Vàng', '04450'],
          ['Xã Nà Hẩu', '04429'],
          ['Xã Ngòi A', '04375'],
          ['Xã Phong Dụ Hạ', '04402'],
          ['Xã Phong Dụ Thượng', '04423'],
          ['Xã Quang Minh', '04399'],
          ['Xã Tân Hợp', '04429'],
          ['Xã Viễn Sơn', '04441'],
          ['Xã Xuân Ái', '04441'],
          ['Xã Xuân Tầm', '04402'],
          ['Xã Yên Hợp', '04441'],
          ['Xã Yên Phú', '04441'],
          ['Xã Yên Thái', '04375']
        ]
      },
      {
        oldDistrict: 'Huyện Yên Bình',
        wards: [
          ['Thị trấn Thác Bà', '04717'],
          ['Thị trấn Yên Bình', '04714'],
          ['Xã Bạch Hà', '04717'],
          ['Xã Bảo Ái', '04750'],
          ['Xã Cảm Ân', '04750'],
          ['Xã Cảm Nhân', '04726'],
          ['Xã Đại Đồng', '04714'],
          ['Xã Đại Minh', '04717'],
          ['Xã Hán Đà', '04717'],
          ['Xã Mông Sơn', '04750'],
          ['Xã Mỹ Gia', '04744'],
          ['Xã Ngọc Chấn', '04726'],
          ['Xã Phú Thịnh', '04279'],
          ['Xã Phúc An', '04744'],
          ['Xã Phúc Ninh', '04744'],
          ['Xã Tân Hương', '04714'],
          ['Xã Tân Nguyên', '04750'],
          ['Xã Thịnh Hưng', '04714'],
          ['Xã Vĩnh Kiên', '04717'],
          ['Xã Vũ Linh', '04717'],
          ['Xã Xuân Lai', '04744'],
          ['Xã Xuân Long', '04726'],
          ['Xã Yên Thành', '04744']
        ]
      },
      {
        oldDistrict: 'Thành phố Yên Bái',
        wards: [
          ['Phường Đồng Tâm', '04252'],
          ['Phường Hồng Hà', '04252'],
          ['Phường Hợp Minh', '04543'],
          ['Phường Minh Tân', '04252'],
          ['Phường Nam Cường', '04273'],
          ['Phường Nguyễn Thái Học', '04252'],
          ['Phường Yên Ninh', '04252'],
          ['Phường Yên Thịnh', '04279'],
          ['Xã Âu Lâu', '04543'],
          ['Xã Giới Phiên', '04543'],
          ['Xã Minh Bảo', '04273'],
          ['Xã Tân Thịnh', '04279'],
          ['Xã Tuy Lộc', '04273'],
          ['Xã Văn Phú', '04279']
        ]
      },
      {
        oldDistrict: 'Thị xã Nghĩa Lộ',
        wards: [
          ['Phường Cầu Thia', '04681'],
          ['Phường Pú Trạng', '04288'],
          ['Phường Tân An', '04288'],
          ['Phường Trung Tâm', '04663'],
          ['Xã Hạnh Sơn', '04681'],
          ['Xã Nghĩa An', '04288'],
          ['Xã Nghĩa Lộ', '04663'],
          ['Xã Nghĩa Lợi', '04663'],
          ['Xã Nghĩa Phúc', '04660'],
          ['Xã Phù Nham', '04663'],
          ['Xã Phúc Sơn', '04681'],
          ['Xã Sơn A', '04660'],
          ['Xã Thạch Lương', '04681'],
          ['Xã Thanh Lương', '04681']
        ]
      }
    ]
  }
];
