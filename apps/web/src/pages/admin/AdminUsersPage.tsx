import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  customerSorts,
  customerTags,
  guestBuyerFilters,
  STAFF_MIN_PASSWORD_LENGTH,
  type AdminCustomerDetail,
  type AdminCustomerKpi,
  type AdminCustomerPage,
  type AdminCustomerSummary,
  type AdminGuestBuyerPage,
  type AdminGuestBuyerSummary,
  type AdminProfile,
  type AdminStaffMember,
  type CustomerSort,
  type CustomerTag,
  type GuestBuyerFilter
} from '@lapbot/contracts';
import { apiJson } from '../../lib/api-client.js';
import { downloadCsv } from '../../lib/csv.js';
import { money } from '../../lib/format.js';
import {
  AdminDetailPaneSkeleton,
  AdminKpiGridSkeleton,
  AdminTableRowsSkeleton,
  RetroTopProgress
} from '../../components/os/RetroOsPrimitives.js';
import {
  IconAlertTriangle,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconCopy,
  IconDownload,
  IconEdit,
  IconExternalLink,
  IconEye,
  IconEyeOff,
  IconKey,
  IconLink,
  IconLock,
  IconLogOut,
  IconMessageSquare,
  IconPackage,
  IconPhone,
  IconPlus,
  IconRefresh,
  IconRotateCcw,
  IconSearch,
  IconSliders,
  IconSpinner,
  IconUnlock,
  IconUserPlus,
  IconUsers
} from '../../components/icons/RetroIcons.js';

type UsersTab = 'members' | 'guests' | 'staff';
type DrawerTab = 'profile' | 'orders' | 'chats';

const TAG_LABELS: Record<CustomerTag, string> = {
  STANDARD: 'Tiêu chuẩn',
  VIP: 'Khách VIP',
  CORPORATE: 'Doanh nghiệp (B2B)',
  WATCHLIST: 'Theo dõi rủi ro'
};

const CUSTOMER_SORT_LABELS: Record<CustomerSort, string> = {
  newest: 'Mới nhất trước',
  spent_desc: 'Chi tiêu cao → thấp',
  orders_desc: 'Số lượng đơn nhiều nhất',
  cancelled_desc: 'Số đơn hủy nhiều nhất'
};

const GUEST_FILTER_LABELS: Record<GuestBuyerFilter, string> = {
  all: 'Tất cả SĐT vãng lai',
  unlinked: 'Chưa có tài khoản TV',
  vip_guest: 'Khách vãng lai VIP',
  high_cancel: 'Cảnh báo hủy đơn cao'
};

function generateTempPassword(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#';
  let out = 'Lb@';
  for (let i = 0; i < length - 3; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function AdminUsersPage() {
  const [tab, setTab] = useState<UsersTab>('members');
  const [me, setMe] = useState<AdminProfile | null>(null);

  // Global feedback banners
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // CRM KPI Strip
  const [kpi, setKpi] = useState<AdminCustomerKpi | null>(null);

  // --- TAB 1: MEMBERS STATE ---
  const [memberSearchDraft, setMemberSearchDraft] = useState('');
  const [memberQ, setMemberQ] = useState('');
  const [memberActiveFilter, setMemberActiveFilter] = useState<'all' | 'true' | 'false'>('all');
  const [memberTagFilter, setMemberTagFilter] = useState<'' | CustomerTag>('');
  const [memberSort, setMemberSort] = useState<CustomerSort>('newest');
  const [memberOffset, setMemberOffset] = useState(0);
  const memberPageSize = 25;

  const [members, setMembers] = useState<AdminCustomerSummary[]>([]);
  const [memberTotal, setMemberTotal] = useState(0);
  const [memberNextOffset, setMemberNextOffset] = useState<number | null>(null);
  const [memberLoading, setMemberLoading] = useState(false);

  // Customer 360 Slide-Over Drawer
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomerDetail | null>(null);
  const [openingCustomerId, setOpeningCustomerId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('profile');
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    default_shipping_address: '',
    customer_tag: 'STANDARD' as CustomerTag,
    admin_note: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [linkingOrders, setLinkingOrders] = useState(false);
  const [exportingMembersCsv, setExportingMembersCsv] = useState(false);
  const [exportingGuestsCsv, setExportingGuestsCsv] = useState(false);

  // Member Create Modal
  const [showCreateMemberModal, setShowCreateMemberModal] = useState(false);
  const [createMemberForm, setCreateMemberForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    default_shipping_address: '',
    customer_tag: 'STANDARD' as CustomerTag,
    admin_note: '',
    link_guest_orders: true
  });
  const [showCreateMemberPw, setShowCreateMemberPw] = useState(false);
  const [creatingMember, setCreatingMember] = useState(false);

  // Member Reset Password Modal
  const [resetPwTarget, setResetPwTarget] = useState<AdminCustomerDetail | null>(null);
  const [resetPwValue, setResetPwValue] = useState('');
  const [showResetPw, setShowResetPw] = useState(true);
  const [resettingPw, setResettingPw] = useState(false);

  // Member Lock/Unlock Confirmation Modal
  const [confirmToggleCustomer, setConfirmToggleCustomer] = useState<AdminCustomerDetail | null>(
    null
  );
  const [toggleCustomerBusy, setToggleCustomerBusy] = useState(false);

  // --- TAB 2: GUEST COD BUYERS STATE ---
  const [guestSearchDraft, setGuestSearchDraft] = useState('');
  const [guestQ, setGuestQ] = useState('');
  const [guestFilter, setGuestFilter] = useState<GuestBuyerFilter>('all');
  const [guestSort, setGuestSort] = useState<CustomerSort>('newest');
  const [guestOffset, setGuestOffset] = useState(0);
  const guestPageSize = 25;

  const [guests, setGuests] = useState<AdminGuestBuyerSummary[]>([]);
  const [guestTotal, setGuestTotal] = useState(0);
  const [guestNextOffset, setGuestNextOffset] = useState<number | null>(null);
  const [guestLoading, setGuestLoading] = useState(false);

  // Promote Guest Modal
  const [promoteTarget, setPromoteTarget] = useState<AdminGuestBuyerSummary | null>(null);
  const [promoteForm, setPromoteForm] = useState({
    email: '',
    password: '',
    full_name: '',
    default_shipping_address: '',
    customer_tag: 'STANDARD' as CustomerTag,
    admin_note: ''
  });
  const [showPromotePw, setShowPromotePw] = useState(true);
  const [promotingGuest, setPromotingGuest] = useState(false);

  // --- TAB 3: STAFF STATE ---
  const [staffList, setStaffList] = useState<AdminStaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffSearch, setStaffSearch] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState<'all' | 'SUPER_ADMIN' | 'STAFF'>('all');
  const [staffActiveFilter, setStaffActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newRole, setNewRole] = useState<'SUPER_ADMIN' | 'STAFF'>('STAFF');
  const [addStaffBusy, setAddStaffBusy] = useState(false);

  const [editingStaff, setEditingStaff] = useState<AdminStaffMember | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editRole, setEditRole] = useState<'SUPER_ADMIN' | 'STAFF'>('STAFF');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editStaffBusy, setEditStaffBusy] = useState(false);
  const [revokingStaffId, setRevokingStaffId] = useState<string | null>(null);

  // --- SELF-SERVICE PASSWORD MODAL (ALL ROLES) ---
  const [showOwnPwModal, setShowOwnPwModal] = useState(false);
  const [oldOwnPw, setOldOwnPw] = useState('');
  const [newOwnPw, setNewOwnPw] = useState('');
  const [confirmOwnPw, setConfirmOwnPw] = useState('');
  const [showOwnPwText, setShowOwnPwText] = useState(false);
  const [savingOwnPw, setSavingOwnPw] = useState(false);

  useEffect(() => {
    void apiJson<AdminProfile>('/admin/me')
      .then(setMe)
      .catch(() => {});
  }, []);

  // Debounce Member search (280ms)
  useEffect(() => {
    const trimmed = memberSearchDraft.trim();
    if (trimmed === memberQ.trim()) return;
    const t = window.setTimeout(() => {
      setMemberQ(trimmed);
      setMemberOffset(0);
    }, 280);
    return () => window.clearTimeout(t);
  }, [memberSearchDraft, memberQ]);

  // Debounce Guest search (280ms)
  useEffect(() => {
    const trimmed = guestSearchDraft.trim();
    if (trimmed === guestQ.trim()) return;
    const t = window.setTimeout(() => {
      setGuestQ(trimmed);
      setGuestOffset(0);
    }, 280);
    return () => window.clearTimeout(t);
  }, [guestSearchDraft, guestQ]);

  const fetchMembers = useCallback(
    async (signal?: AbortSignal) => {
      setMemberLoading(true);
      try {
        const q = new URLSearchParams({ limit: String(memberPageSize) });
        if (memberOffset > 0) q.set('offset', String(memberOffset));
        if (memberQ.trim()) q.set('q', memberQ.trim());
        if (memberActiveFilter !== 'all') q.set('is_active', memberActiveFilter);
        if (memberTagFilter) q.set('customer_tag', memberTagFilter);
        if (memberSort !== 'newest') q.set('sort', memberSort);

        const res = await apiJson<AdminCustomerPage>(`/admin/customers?${q}`, { signal });
        setMembers(res.items);
        setMemberTotal(res.total_count ?? res.items.length);
        setMemberNextOffset(res.next_offset ?? null);
        if (res.kpi) setKpi(res.kpi);
      } catch (err: unknown) {
        if (!signal?.aborted) {
          setErrorMsg(err instanceof Error ? err.message : 'Không tải được danh sách thành viên.');
        }
      } finally {
        if (!signal?.aborted) setMemberLoading(false);
      }
    },
    [memberOffset, memberQ, memberActiveFilter, memberTagFilter, memberSort]
  );

  const fetchGuests = useCallback(
    async (signal?: AbortSignal) => {
      setGuestLoading(true);
      try {
        const q = new URLSearchParams({ limit: String(guestPageSize) });
        if (guestOffset > 0) q.set('offset', String(guestOffset));
        if (guestQ.trim()) q.set('q', guestQ.trim());
        if (guestFilter !== 'all') q.set('filter', guestFilter);
        if (guestSort !== 'newest') q.set('sort', guestSort);

        const res = await apiJson<AdminGuestBuyerPage>(`/admin/customers/guests?${q}`, { signal });
        setGuests(res.items);
        setGuestTotal(res.total_count);
        setGuestNextOffset(res.next_offset);
      } catch (err: unknown) {
        if (!signal?.aborted) {
          setErrorMsg(
            err instanceof Error ? err.message : 'Không tải được danh sách khách vãng lai.'
          );
        }
      } finally {
        if (!signal?.aborted) setGuestLoading(false);
      }
    },
    [guestOffset, guestQ, guestFilter, guestSort]
  );

  const fetchStaff = useCallback(async () => {
    setStaffLoading(true);
    try {
      const res = await apiJson<AdminStaffMember[]>('/admin/staff');
      setStaffList(res);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Không tải được danh sách nhân sự.');
    } finally {
      setStaffLoading(false);
    }
  }, []);

  // Preload KPI strip on initial mount even if user switches tabs
  useEffect(() => {
    if (!kpi) {
      void apiJson<AdminCustomerPage>('/admin/customers?limit=1')
        .then(res => {
          if (res.kpi) setKpi(res.kpi);
        })
        .catch(() => {});
    }
  }, [kpi]);

  useEffect(() => {
    if (tab !== 'members') return;
    const controller = new AbortController();
    void fetchMembers(controller.signal);
    return () => controller.abort();
  }, [tab, fetchMembers]);

  useEffect(() => {
    if (tab !== 'guests') return;
    const controller = new AbortController();
    void fetchGuests(controller.signal);
    return () => controller.abort();
  }, [tab, fetchGuests]);

  useEffect(() => {
    if (tab === 'staff') {
      void fetchStaff();
    }
  }, [tab, fetchStaff]);

  const applyDetailToDrawer = (detail: AdminCustomerDetail) => {
    setSelectedCustomer(detail);
    setProfileForm({
      full_name: detail.full_name,
      email: detail.email,
      phone: detail.phone ?? '',
      default_shipping_address: detail.default_shipping_address ?? '',
      customer_tag: detail.customer_tag ?? 'STANDARD',
      admin_note: detail.admin_note ?? ''
    });
  };

  const handleOpenCustomer = async (id: string) => {
    setErrorMsg(null);
    setOpeningCustomerId(id);
    if (selectedCustomer?.customer_id !== id) {
      setSelectedCustomer(null);
    }
    try {
      const detail = await apiJson<AdminCustomerDetail>(`/admin/customers/${id}`);
      applyDetailToDrawer(detail);
      setDrawerTab('profile');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Không tải được hồ sơ khách hàng.');
    } finally {
      setOpeningCustomerId(prev => (prev === id ? null : prev));
    }
  };

  const handleSaveCustomerProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setSavingProfile(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const body: Record<string, unknown> = {};
      if (profileForm.full_name.trim() !== selectedCustomer.full_name) {
        body.full_name = profileForm.full_name.trim();
      }
      if (profileForm.email.trim().toLowerCase() !== selectedCustomer.email.toLowerCase()) {
        body.email = profileForm.email.trim();
      }
      const nextPhone = profileForm.phone.trim() || null;
      if (nextPhone !== (selectedCustomer.phone ?? null)) {
        body.phone = nextPhone;
      }
      if (
        profileForm.default_shipping_address.trim() !==
        (selectedCustomer.default_shipping_address ?? '')
      ) {
        body.default_shipping_address = profileForm.default_shipping_address.trim();
      }
      if (profileForm.customer_tag !== (selectedCustomer.customer_tag ?? 'STANDARD')) {
        body.customer_tag = profileForm.customer_tag;
      }
      if (profileForm.admin_note.trim() !== (selectedCustomer.admin_note ?? '')) {
        body.admin_note = profileForm.admin_note.trim();
      }

      if (Object.keys(body).length === 0) {
        setSuccessMsg('Thông tin hồ sơ chưa có thay đổi mới.');
        setSavingProfile(false);
        return;
      }

      const updated = await apiJson<AdminCustomerDetail>(
        `/admin/customers/${selectedCustomer.customer_id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(body)
        }
      );
      applyDetailToDrawer(updated);
      setSuccessMsg(`Đã lưu cập nhật hồ sơ cho ${updated.full_name}!`);
      void fetchMembers();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lưu hồ sơ thất bại.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLinkPhoneOrders = async () => {
    if (!selectedCustomer) return;
    setLinkingOrders(true);
    setErrorMsg(null);
    try {
      const updated = await apiJson<AdminCustomerDetail>(
        `/admin/customers/${selectedCustomer.customer_id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ link_phone_orders: true })
        }
      );
      applyDetailToDrawer(updated);
      setDrawerTab('orders');
      setSuccessMsg(`Đã gộp toàn bộ đơn vãng lai trùng SĐT ${updated.phone} vào hồ sơ thành viên!`);
      void fetchMembers();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Gộp đơn theo SĐT thất bại.');
    } finally {
      setLinkingOrders(false);
    }
  };

  const handleCreateMember = async (e: FormEvent) => {
    e.preventDefault();
    setCreatingMember(true);
    setErrorMsg(null);
    try {
      const created = await apiJson<AdminCustomerDetail>('/admin/customers', {
        method: 'POST',
        body: JSON.stringify({
          full_name: createMemberForm.full_name.trim(),
          email: createMemberForm.email.trim(),
          phone: createMemberForm.phone.trim() || null,
          password: createMemberForm.password,
          default_shipping_address: createMemberForm.default_shipping_address.trim(),
          customer_tag: createMemberForm.customer_tag,
          admin_note: createMemberForm.admin_note.trim(),
          link_guest_orders: createMemberForm.link_guest_orders
        })
      });
      setShowCreateMemberModal(false);
      setCreateMemberForm({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        default_shipping_address: '',
        customer_tag: 'STANDARD',
        admin_note: '',
        link_guest_orders: true
      });
      applyDetailToDrawer(created);
      setSuccessMsg(`Đã tạo tài khoản thành viên ${created.email} thành công!`);
      void fetchMembers();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Tạo khách hàng mới thất bại.');
    } finally {
      setCreatingMember(false);
    }
  };

  const handleResetCustomerPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetPwTarget) return;
    setResettingPw(true);
    setErrorMsg(null);
    try {
      const updated = await apiJson<AdminCustomerDetail>(
        `/admin/customers/${resetPwTarget.customer_id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ new_password: resetPwValue })
        }
      );
      applyDetailToDrawer(updated);
      setResetPwTarget(null);
      setResetPwValue('');
      setSuccessMsg(`Đã đặt lại mật khẩu và thu hồi các phiên cũ của ${updated.email}!`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Đặt lại mật khẩu thất bại.');
    } finally {
      setResettingPw(false);
    }
  };

  const executeToggleCustomerActive = async () => {
    if (!confirmToggleCustomer) return;
    const nextState = !confirmToggleCustomer.is_active;
    setToggleCustomerBusy(true);
    setErrorMsg(null);
    try {
      const updated = await apiJson<AdminCustomerDetail>(
        `/admin/customers/${confirmToggleCustomer.customer_id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ is_active: nextState })
        }
      );
      if (selectedCustomer?.customer_id === updated.customer_id) {
        applyDetailToDrawer(updated);
      }
      setConfirmToggleCustomer(null);
      setSuccessMsg(`Đã ${nextState ? 'mở khóa' : 'khóa'} tài khoản ${updated.email} thành công!`);
      void fetchMembers();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái tài khoản.');
    } finally {
      setToggleCustomerBusy(false);
    }
  };

  const openPromoteModal = (guest: AdminGuestBuyerSummary) => {
    setPromoteTarget(guest);
    setPromoteForm({
      email: '',
      password: generateTempPassword(10),
      full_name: guest.latest_name,
      default_shipping_address: guest.latest_address,
      customer_tag:
        guest.risk_flag === 'VIP_GUEST'
          ? 'VIP'
          : guest.risk_flag === 'HIGH_CANCEL'
            ? 'WATCHLIST'
            : 'STANDARD',
      admin_note: ''
    });
    setShowPromotePw(true);
  };

  const handlePromoteGuest = async (e: FormEvent) => {
    e.preventDefault();
    if (!promoteTarget) return;
    setPromotingGuest(true);
    setErrorMsg(null);
    try {
      const created = await apiJson<AdminCustomerDetail>('/admin/customers/guests/promote', {
        method: 'POST',
        body: JSON.stringify({
          phone: promoteTarget.phone,
          email: promoteForm.email.trim(),
          password: promoteForm.password,
          full_name: promoteForm.full_name.trim(),
          default_shipping_address: promoteForm.default_shipping_address.trim(),
          customer_tag: promoteForm.customer_tag,
          admin_note: promoteForm.admin_note.trim()
        })
      });
      setPromoteTarget(null);
      setTab('members');
      applyDetailToDrawer(created);
      setDrawerTab('orders');
      setSuccessMsg(
        `Đã nâng cấp SĐT ${created.phone} thành tài khoản thành viên (${created.email}) và tự động gộp ${created.orders.length} đơn COD!`
      );
      void fetchMembers();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Nâng cấp khách vãng lai thất bại.');
    } finally {
      setPromotingGuest(false);
    }
  };

  const handleExportMembersCsv = async () => {
    setExportingMembersCsv(true);
    try {
      const q = new URLSearchParams({ limit: '200' });
      if (memberQ.trim()) q.set('q', memberQ.trim());
      if (memberActiveFilter !== 'all') q.set('is_active', memberActiveFilter);
      if (memberTagFilter) q.set('customer_tag', memberTagFilter);
      if (memberSort !== 'newest') q.set('sort', memberSort);

      const res = await apiJson<AdminCustomerPage>(`/admin/customers?${q}`);
      downloadCsv(
        `lapbot-khach-thanh-vien-${new Date().toISOString().slice(0, 10)}.csv`,
        [
          'Mã KH',
          'Họ tên',
          'Email',
          'Số điện thoại',
          'Nhãn CRM',
          'Tổng đơn',
          'Đơn thành công',
          'Đơn hủy',
          'Tổng chi tiêu (VND)',
          'Trạng thái',
          'Ghi chú nội bộ',
          'Ngày tham gia'
        ],
        res.items.map(c => [
          c.customer_id,
          c.full_name,
          c.email,
          c.phone ?? '',
          TAG_LABELS[c.customer_tag ?? 'STANDARD'],
          c.orders_count,
          c.delivered_orders_count ?? 0,
          c.cancelled_orders_count ?? 0,
          c.total_spent_vnd,
          c.is_active ? 'HOAT_DONG' : 'DA_KHOA',
          c.admin_note ?? '',
          new Date(c.created_at).toLocaleDateString('vi-VN')
        ])
      );
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Xuất CSV thành viên thất bại.');
    } finally {
      setExportingMembersCsv(false);
    }
  };

  const handleExportGuestsCsv = async () => {
    setExportingGuestsCsv(true);
    try {
      const q = new URLSearchParams({ limit: '200' });
      if (guestQ.trim()) q.set('q', guestQ.trim());
      if (guestFilter !== 'all') q.set('filter', guestFilter);
      if (guestSort !== 'newest') q.set('sort', guestSort);

      const res = await apiJson<AdminGuestBuyerPage>(`/admin/customers/guests?${q}`);
      downloadCsv(
        `lapbot-khach-vang-lai-cod-${new Date().toISOString().slice(0, 10)}.csv`,
        [
          'Số điện thoại',
          'Tên nhận hàng gần nhất',
          'Địa chỉ gần nhất',
          'Tín nhiệm',
          'Tổng đơn',
          'Đã giao',
          'Đã hủy',
          'Tổng chi tiêu (VND)',
          'Đơn gần nhất'
        ],
        res.items.map(g => [
          g.phone,
          g.latest_name,
          g.latest_address,
          g.risk_flag,
          g.orders_count,
          g.delivered_count,
          g.cancelled_count,
          g.total_spent_vnd,
          new Date(g.last_order_at).toLocaleDateString('vi-VN')
        ])
      );
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Xuất CSV khách vãng lai thất bại.');
    } finally {
      setExportingGuestsCsv(false);
    }
  };

  // Staff handlers
  const handleCreateStaff = async (e: FormEvent) => {
    e.preventDefault();
    setAddStaffBusy(true);
    setErrorMsg(null);
    try {
      await apiJson('/admin/staff', {
        method: 'POST',
        body: JSON.stringify({
          username: newUsername.trim(),
          display_name: (newDisplayName || newUsername).trim(),
          password: newPassword,
          role: newRole
        })
      });
      setShowAddStaffModal(false);
      setNewUsername('');
      setNewDisplayName('');
      setNewPassword('');
      setShowNewPassword(false);
      setSuccessMsg('Đã tạo tài khoản nhân sự vận hành mới!');
      await fetchStaff();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi tạo nhân sự.');
    } finally {
      setAddStaffBusy(false);
    }
  };

  const handleOpenEditStaff = (staff: AdminStaffMember) => {
    setEditingStaff(staff);
    setEditDisplayName(staff.display_name);
    setEditRole(staff.role);
    setEditIsActive(staff.is_active);
    setEditPassword('');
    setShowEditPassword(false);
  };

  const handleSaveStaffEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    if (editPassword && editPassword.length < STAFF_MIN_PASSWORD_LENGTH) {
      setErrorMsg(`Mật khẩu nhân sự phải có ít nhất ${STAFF_MIN_PASSWORD_LENGTH} ký tự.`);
      return;
    }
    setEditStaffBusy(true);
    setErrorMsg(null);
    try {
      const body: Record<string, unknown> = {
        display_name: editDisplayName.trim(),
        role: editRole,
        is_active: editIsActive
      };
      if (editPassword) {
        body.new_password = editPassword;
      }
      await apiJson(`/admin/staff/${editingStaff.admin_id}`, {
        method: 'PATCH',
        body: JSON.stringify(body)
      });
      setEditingStaff(null);
      setSuccessMsg('Đã cập nhật thông tin & phân quyền nhân sự!');
      await fetchStaff();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi cập nhật nhân sự.');
    } finally {
      setEditStaffBusy(false);
    }
  };

  const handleRevokeStaffSessions = async (staff: AdminStaffMember) => {
    setRevokingStaffId(staff.admin_id);
    setErrorMsg(null);
    try {
      const res = await apiJson<{ ok: boolean; revoked_count: number }>(
        `/admin/staff/${staff.admin_id}/revoke-sessions`,
        {
          method: 'POST',
          body: JSON.stringify({})
        }
      );
      setSuccessMsg(
        `Đã thu hồi ${res.revoked_count} phiên đăng nhập đang mở của tài khoản @${staff.username}.`
      );
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Thu hồi phiên đăng nhập thất bại.');
    } finally {
      setRevokingStaffId(null);
    }
  };

  const handleChangeOwnPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newOwnPw.length < STAFF_MIN_PASSWORD_LENGTH) {
      setErrorMsg(`Mật khẩu mới tối thiểu ${STAFF_MIN_PASSWORD_LENGTH} ký tự.`);
      return;
    }
    if (newOwnPw !== confirmOwnPw) {
      setErrorMsg('Mật khẩu xác nhận nhập lại không khớp.');
      return;
    }
    setSavingOwnPw(true);
    setErrorMsg(null);
    try {
      await apiJson('/admin/me/password', {
        method: 'POST',
        body: JSON.stringify({
          old_password: oldOwnPw,
          new_password: newOwnPw
        })
      });
      setShowOwnPwModal(false);
      setOldOwnPw('');
      setNewOwnPw('');
      setConfirmOwnPw('');
      setSuccessMsg('Đã đổi mật khẩu quản trị cá nhân của bạn thành công!');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Đổi mật khẩu cá nhân thất bại.');
    } finally {
      setSavingOwnPw(false);
    }
  };

  const filteredStaff = useMemo(() => {
    const keyword = staffSearch.trim().toLowerCase();
    return staffList.filter(s => {
      if (staffRoleFilter !== 'all' && s.role !== staffRoleFilter) return false;
      if (staffActiveFilter === 'active' && !s.is_active) return false;
      if (staffActiveFilter === 'inactive' && s.is_active) return false;
      if (keyword) {
        return (
          s.username.toLowerCase().includes(keyword) ||
          s.display_name.toLowerCase().includes(keyword)
        );
      }
      return true;
    });
  }, [staffList, staffSearch, staffRoleFilter, staffActiveFilter]);

  const memberPageNum = Math.floor(memberOffset / memberPageSize) + 1;
  const memberTotalPages = Math.max(1, Math.ceil(memberTotal / memberPageSize));
  const guestPageNum = Math.floor(guestOffset / guestPageSize) + 1;
  const guestTotalPages = Math.max(1, Math.ceil(guestTotal / guestPageSize));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header & Self-Service Password Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ flex: '1 1 320px', minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <IconUsers size={22} />
            <span>QUẢN TRỊ KHÁCH HÀNG CRM 360° & NHÂN SỰ VẬN HÀNH</span>
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--ink-secondary)' }}>
            Hồ sơ thành viên · Đối chiếu khách vãng lai COD & rủi ro hủy đơn · Phân quyền quản trị
            viên.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginLeft: 'auto'
          }}
        >
          <button
            type="button"
            className="retro-btn"
            onClick={() => setShowOwnPwModal(true)}
            title="Đổi mật khẩu tài khoản quản trị đang đăng nhập của bạn"
          >
            <IconKey size={14} />
            <span>ĐỔI MẬT KHẨU CỦA TÔI</span>
          </button>

          {tab === 'members' && (
            <button
              type="button"
              className="retro-btn retro-btn-primary"
              onClick={() => {
                setCreateMemberForm(prev => ({ ...prev, password: generateTempPassword(10) }));
                setShowCreateMemberPw(true);
                setShowCreateMemberModal(true);
              }}
            >
              <IconUserPlus size={15} />
              <span>THÊM KHÁCH HÀNG</span>
            </button>
          )}

          {tab === 'staff' && me?.role === 'SUPER_ADMIN' && (
            <button
              type="button"
              className="retro-btn retro-btn-primary"
              onClick={() => setShowAddStaffModal(true)}
            >
              <IconPlus size={15} />
              <span>THÊM NHÂN SỰ MỚI</span>
            </button>
          )}
        </div>
      </div>

      {/* 6-Card Clickable CRM KPI Strip */}
      {!kpi && <AdminKpiGridSkeleton count={5} mini />}
      {kpi && (
        <div className="admin-kpi-strip-compact">
          <button
            type="button"
            className={`admin-kpi-mini-card ${tab === 'members' && memberActiveFilter === 'all' && !memberTagFilter ? 'active' : ''}`}
            onClick={() => {
              setTab('members');
              setMemberActiveFilter('all');
              setMemberTagFilter('');
              setMemberOffset(0);
            }}
          >
            <span className="admin-kpi-mini-label">TỔNG THÀNH VIÊN</span>
            <span className="admin-kpi-mini-val">{kpi.total_members}</span>
            <span className="admin-kpi-mini-sub">
              {kpi.active_members} hoạt động · {kpi.locked_members} đã khóa
            </span>
          </button>

          <button
            type="button"
            className={`admin-kpi-mini-card ${tab === 'members' && memberTagFilter === 'VIP' ? 'active' : ''}`}
            onClick={() => {
              setTab('members');
              setMemberTagFilter('VIP');
              setMemberOffset(0);
            }}
          >
            <span className="admin-kpi-mini-label">KHÁCH VIP & B2B</span>
            <span className="admin-kpi-mini-val" style={{ color: 'var(--accent-primary)' }}>
              {kpi.vip_members}
            </span>
            <span className="admin-kpi-mini-sub">Ưu tiên CSKH & hậu mãi</span>
          </button>

          <button
            type="button"
            className={`admin-kpi-mini-card ${tab === 'members' && memberTagFilter === 'WATCHLIST' ? 'active' : ''}`}
            onClick={() => {
              setTab('members');
              setMemberTagFilter('WATCHLIST');
              setMemberOffset(0);
            }}
          >
            <span className="admin-kpi-mini-label">THEO DÕI RỦI RO</span>
            <span
              className="admin-kpi-mini-val"
              style={{
                color: kpi.watchlist_members > 0 ? 'var(--status-danger)' : 'var(--ink-primary)'
              }}
            >
              {kpi.watchlist_members}
            </span>
            <span className="admin-kpi-mini-sub">Cần gọi xác nhận kỹ COD</span>
          </button>

          <button
            type="button"
            className={`admin-kpi-mini-card ${tab === 'guests' ? 'active' : ''}`}
            onClick={() => {
              setTab('guests');
              setGuestFilter('all');
              setGuestOffset(0);
            }}
          >
            <span className="admin-kpi-mini-label">KHÁCH VÃNG LAI COD</span>
            <span className="admin-kpi-mini-val">{kpi.guest_buyers_count}</span>
            <span className="admin-kpi-mini-sub">SĐT đặt mua không đăng nhập</span>
          </button>

          <button
            type="button"
            className={`admin-kpi-mini-card ${tab === 'members' && memberSort === 'spent_desc' ? 'active' : ''}`}
            onClick={() => {
              setTab('members');
              setMemberSort('spent_desc');
              setMemberOffset(0);
            }}
          >
            <span className="admin-kpi-mini-label">DOANH THU THÀNH VIÊN</span>
            <span
              className="admin-kpi-mini-val"
              style={{ fontSize: '1.15rem', color: 'var(--status-success)' }}
            >
              {money(kpi.total_member_revenue_vnd)}
            </span>
            <span className="admin-kpi-mini-sub">Đơn DELIVERED thành công</span>
          </button>
        </div>
      )}

      {/* 3-Tab Segmented Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          borderBottom: '2px solid var(--ink-border)',
          paddingBottom: '10px'
        }}
      >
        <button
          type="button"
          className={`retro-btn ${tab === 'members' ? 'retro-btn-primary' : ''}`}
          onClick={() => setTab('members')}
        >
          <span>1. KHÁCH HÀNG THÀNH VIÊN</span>
          {kpi && <span>({kpi.total_members})</span>}
        </button>

        <button
          type="button"
          className={`retro-btn ${tab === 'guests' ? 'retro-btn-primary' : ''}`}
          onClick={() => setTab('guests')}
        >
          <span>2. KHÁCH VÃNG LAI COD</span>
          {kpi && <span>({kpi.guest_buyers_count})</span>}
        </button>

        {me?.role === 'SUPER_ADMIN' && (
          <button
            type="button"
            className={`retro-btn ${tab === 'staff' ? 'retro-btn-primary' : ''}`}
            onClick={() => setTab('staff')}
          >
            <span>3. NHÂN SỰ VẬN HÀNH (STAFF)</span>
          </button>
        )}
      </div>

      {/* Feedback Banners */}
      {errorMsg && (
        <div
          role="alert"
          style={{
            background: '#FFF2F0',
            border: '1.5px solid var(--status-danger)',
            color: 'var(--status-danger)',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>
            <strong>Lỗi:</strong> {errorMsg}
          </span>
          <button
            type="button"
            className="retro-icon-btn"
            onClick={() => setErrorMsg(null)}
            aria-label="Đóng"
          >
            <IconClose size={14} />
          </button>
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          style={{
            background: 'var(--accent-mint)',
            border: '1.5px solid var(--ink-border)',
            color: 'var(--status-success)',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>{successMsg}</span>
          <button
            type="button"
            className="retro-icon-btn"
            onClick={() => setSuccessMsg(null)}
            aria-label="Đóng"
          >
            <IconClose size={14} />
          </button>
        </div>
      )}

      {/* =====================================================================
          TAB 1: REGISTERED MEMBERS
         ===================================================================== */}
      {tab === 'members' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Filter Bar */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              flexWrap: 'wrap',
              background: 'var(--bg-surface-pure)',
              border: '1.5px solid var(--ink-border)',
              borderRadius: '6px',
              padding: '10px 12px'
            }}
          >
            <div
              style={{
                flex: '1 1 250px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                border: '1.5px solid var(--ink-border)',
                borderRadius: '4px',
                background: 'var(--bg-surface)'
              }}
            >
              <IconSearch size={15} />
              <input
                type="text"
                placeholder="Gõ tìm tức thì theo tên, email, SĐT hoặc ghi chú nội bộ..."
                value={memberSearchDraft}
                onChange={e => setMemberSearchDraft(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '13px'
                }}
              />
              {memberSearchDraft && (
                <button
                  type="button"
                  className="retro-icon-btn"
                  aria-label="Xóa tìm kiếm"
                  onClick={() => {
                    setMemberSearchDraft('');
                    setMemberQ('');
                    setMemberOffset(0);
                  }}
                >
                  <IconClose size={13} />
                </button>
              )}
            </div>

            <select
              value={memberTagFilter}
              onChange={e => {
                setMemberTagFilter(e.target.value as '' | CustomerTag);
                setMemberOffset(0);
              }}
              style={{
                padding: '7px 10px',
                border: '1.5px solid var(--ink-border)',
                borderRadius: '4px',
                fontSize: '12px',
                background: 'var(--bg-surface)'
              }}
            >
              <option value="">Mọi phân loại CRM</option>
              {customerTags.map(t => (
                <option key={t} value={t}>
                  {TAG_LABELS[t]}
                </option>
              ))}
            </select>

            <select
              value={memberActiveFilter}
              onChange={e => {
                setMemberActiveFilter(e.target.value as 'all' | 'true' | 'false');
                setMemberOffset(0);
              }}
              style={{
                padding: '7px 10px',
                border: '1.5px solid var(--ink-border)',
                borderRadius: '4px',
                fontSize: '12px',
                background: 'var(--bg-surface)'
              }}
            >
              <option value="all">Mọi trạng thái</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Đã bị khóa</option>
            </select>

            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700
              }}
            >
              <IconSliders size={13} />
              <select
                value={memberSort}
                onChange={e => {
                  setMemberSort(e.target.value as CustomerSort);
                  setMemberOffset(0);
                }}
                style={{
                  padding: '7px 10px',
                  border: '1.5px solid var(--ink-border)',
                  borderRadius: '4px',
                  fontSize: '12px',
                  background: 'var(--bg-surface-raised)'
                }}
              >
                {customerSorts.map(s => (
                  <option key={s} value={s}>
                    {CUSTOMER_SORT_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>

            {(memberQ ||
              memberTagFilter ||
              memberActiveFilter !== 'all' ||
              memberSort !== 'newest') && (
              <button
                type="button"
                className="retro-btn retro-btn-sm"
                onClick={() => {
                  setMemberSearchDraft('');
                  setMemberQ('');
                  setMemberTagFilter('');
                  setMemberActiveFilter('all');
                  setMemberSort('newest');
                  setMemberOffset(0);
                }}
              >
                <IconRotateCcw size={13} />
                <span>Đặt lại</span>
              </button>
            )}

            <button
              type="button"
              disabled={exportingMembersCsv}
              className={`retro-btn retro-btn-sm ${exportingMembersCsv ? 'is-busy' : ''}`}
              onClick={() => void handleExportMembersCsv()}
            >
              {exportingMembersCsv ? <IconSpinner size={13} /> : <IconDownload size={13} />}
              <span>{exportingMembersCsv ? 'ĐANG XUẤT...' : 'XUẤT CSV'}</span>
            </button>
          </div>

          <div className="admin-table-wrap" style={{ position: 'relative' }}>
            <RetroTopProgress
              active={memberLoading && members.length > 0}
              label="Đang tải danh sách thành viên"
            />
            <table
              className={`admin-table ${memberLoading && members.length > 0 ? 'is-refreshing-pane' : ''}`}
            >
              <thead>
                <tr>
                  <th>Khách hàng & Nhãn CRM</th>
                  <th>Thông tin liên hệ</th>
                  <th>Lịch sử đơn (Giao / Hủy)</th>
                  <th>Tổng chi tiêu</th>
                  <th>Trạng thái</th>
                  <th>Ngày tham gia</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {memberLoading && members.length === 0 ? (
                  <AdminTableRowsSkeleton columns={7} rows={6} />
                ) : members.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{ textAlign: 'center', padding: '26px', color: 'var(--text-muted)' }}
                    >
                      Không có khách hàng thành viên nào khớp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  members.map(c => {
                    const tag = c.customer_tag ?? 'STANDARD';
                    return (
                      <tr
                        key={c.customer_id}
                        style={{
                          background:
                            selectedCustomer?.customer_id === c.customer_id
                              ? 'var(--accent-amber-light)'
                              : undefined
                        }}
                      >
                        <td>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              flexWrap: 'wrap'
                            }}
                          >
                            <button
                              type="button"
                              className="retro-icon-btn"
                              style={{ fontWeight: 800, fontSize: '13.5px', padding: '2px 4px' }}
                              onClick={() => void handleOpenCustomer(c.customer_id)}
                            >
                              {c.full_name}
                            </button>
                            <span className={`crm-tag-badge ${tag}`}>{TAG_LABELS[tag]}</span>
                          </div>
                          {c.admin_note && (
                            <div
                              style={{
                                fontSize: '11.5px',
                                color: 'var(--text-secondary)',
                                marginTop: '2px',
                                maxWidth: '280px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              title={c.admin_note}
                            >
                              Ghi chú: {c.admin_note}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ fontSize: '12.5px', fontWeight: 600 }}>{c.email}</div>
                          <div
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '11.5px',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            {c.phone || 'Chưa gắn SĐT'}
                          </div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                          <strong>{c.orders_count}</strong> đơn{' '}
                          <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                            ({c.delivered_orders_count ?? 0} giao · {c.cancelled_orders_count ?? 0}{' '}
                            hủy)
                          </span>
                        </td>
                        <td
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 800,
                            color: 'var(--accent-primary)'
                          }}
                        >
                          {money(c.total_spent_vnd)}
                        </td>
                        <td>
                          <span
                            className={`admin-badge ${c.is_active ? 'status-success' : 'status-danger'}`}
                          >
                            {c.is_active ? 'HOẠT ĐỘNG' : 'ĐÃ KHÓA'}
                          </span>
                        </td>
                        <td
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11.5px',
                            color: 'var(--text-muted)'
                          }}
                        >
                          {new Date(c.created_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            disabled={openingCustomerId === c.customer_id}
                            className={`retro-btn retro-btn-sm ${openingCustomerId === c.customer_id ? 'is-busy' : ''}`}
                            onClick={() => void handleOpenCustomer(c.customer_id)}
                          >
                            {openingCustomerId === c.customer_id ? (
                              <IconSpinner size={12} />
                            ) : (
                              <IconEdit size={12} />
                            )}
                            <span>Hồ sơ 360°</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            <div className="admin-pagination-bar">
              <span>
                Tổng cộng: <strong>{memberTotal}</strong> thành viên · Trang{' '}
                <strong>{memberPageNum}</strong> / <strong>{memberTotalPages}</strong>
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  disabled={memberOffset === 0 || memberLoading}
                  className="retro-btn retro-btn-sm"
                  onClick={() => setMemberOffset(prev => Math.max(0, prev - memberPageSize))}
                >
                  <IconChevronLeft size={14} />
                  <span>Trước</span>
                </button>
                <button
                  type="button"
                  disabled={memberNextOffset === null || memberLoading}
                  className="retro-btn retro-btn-sm"
                  onClick={() => {
                    if (memberNextOffset !== null) setMemberOffset(memberNextOffset);
                  }}
                >
                  <span>Tiếp</span>
                  <IconChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: GUEST COD BUYERS (BY PHONE)
         ===================================================================== */}
      {tab === 'guests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              flexWrap: 'wrap',
              background: 'var(--bg-surface-pure)',
              border: '1.5px solid var(--ink-border)',
              borderRadius: '6px',
              padding: '10px 12px'
            }}
          >
            <div
              style={{
                flex: '1 1 250px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                border: '1.5px solid var(--ink-border)',
                borderRadius: '4px',
                background: 'var(--bg-surface)'
              }}
            >
              <IconSearch size={15} />
              <input
                type="text"
                placeholder="Tìm khách vãng lai theo SĐT, tên nhận hàng, địa chỉ, mã đơn..."
                value={guestSearchDraft}
                onChange={e => setGuestSearchDraft(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '13px'
                }}
              />
              {guestSearchDraft && (
                <button
                  type="button"
                  className="retro-icon-btn"
                  onClick={() => {
                    setGuestSearchDraft('');
                    setGuestQ('');
                    setGuestOffset(0);
                  }}
                >
                  <IconClose size={13} />
                </button>
              )}
            </div>

            <select
              value={guestFilter}
              onChange={e => {
                setGuestFilter(e.target.value as GuestBuyerFilter);
                setGuestOffset(0);
              }}
              style={{
                padding: '7px 10px',
                border: '1.5px solid var(--ink-border)',
                borderRadius: '4px',
                fontSize: '12px',
                background: 'var(--bg-surface)'
              }}
            >
              {guestBuyerFilters.map(f => (
                <option key={f} value={f}>
                  {GUEST_FILTER_LABELS[f]}
                </option>
              ))}
            </select>

            <select
              value={guestSort}
              onChange={e => {
                setGuestSort(e.target.value as CustomerSort);
                setGuestOffset(0);
              }}
              style={{
                padding: '7px 10px',
                border: '1.5px solid var(--ink-border)',
                borderRadius: '4px',
                fontSize: '12px',
                background: 'var(--bg-surface-raised)'
              }}
            >
              {customerSorts.map(s => (
                <option key={s} value={s}>
                  {CUSTOMER_SORT_LABELS[s]}
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={exportingGuestsCsv}
              className={`retro-btn retro-btn-sm ${exportingGuestsCsv ? 'is-busy' : ''}`}
              onClick={() => void handleExportGuestsCsv()}
            >
              {exportingGuestsCsv ? <IconSpinner size={13} /> : <IconDownload size={13} />}
              <span>{exportingGuestsCsv ? 'ĐANG XUẤT...' : 'XUẤT CSV'}</span>
            </button>
          </div>

          <div className="admin-table-wrap" style={{ position: 'relative' }}>
            <RetroTopProgress
              active={guestLoading && guests.length > 0}
              label="Đang tải khách vãng lai COD"
            />
            <table
              className={`admin-table ${guestLoading && guests.length > 0 ? 'is-refreshing-pane' : ''}`}
            >
              <thead>
                <tr>
                  <th>SĐT & Người nhận gần nhất</th>
                  <th>Tín nhiệm COD</th>
                  <th>Thống kê đơn vãng lai</th>
                  <th>Chi tiêu thành công</th>
                  <th>Mã đơn gần đây</th>
                  <th style={{ textAlign: 'right' }}>Chuyển đổi CRM</th>
                </tr>
              </thead>
              <tbody>
                {guestLoading && guests.length === 0 ? (
                  <AdminTableRowsSkeleton columns={6} rows={6} />
                ) : guests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ textAlign: 'center', padding: '26px', color: 'var(--text-muted)' }}
                    >
                      Không có khách vãng lai nào khớp điều kiện lọc.
                    </td>
                  </tr>
                ) : (
                  guests.map(g => (
                    <tr key={g.phone}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <IconPhone size={13} />
                          <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                            {g.phone}
                          </strong>
                          <span>· {g.latest_name}</span>
                        </div>
                        <div
                          style={{
                            fontSize: '11.5px',
                            color: 'var(--text-secondary)',
                            maxWidth: '300px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={g.latest_address}
                        >
                          {g.latest_address || 'Chưa lưu địa chỉ'}
                        </div>
                      </td>
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            alignItems: 'flex-start'
                          }}
                        >
                          <span className={`crm-tag-badge ${g.risk_flag}`}>
                            {g.risk_flag === 'HIGH_CANCEL'
                              ? 'RỦI RO HỦY ĐƠN CAO'
                              : g.risk_flag === 'VIP_GUEST'
                                ? 'KHÁCH QUEN UY TÍN'
                                : 'VÃNG LAI TIÊU CHUẨN'}
                          </span>
                          {g.matched_member_email && (
                            <span
                              style={{
                                fontSize: '11px',
                                color: 'var(--status-success)',
                                fontWeight: 700
                              }}
                            >
                              Trùng SĐT TV: {g.matched_member_email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                        <strong>{g.orders_count}</strong> đơn ({g.delivered_count} giao ·{' '}
                        <span
                          style={{
                            color: g.cancelled_count > 0 ? 'var(--status-danger)' : 'inherit'
                          }}
                        >
                          {g.cancelled_count} hủy
                        </span>
                        {g.active_orders_count > 0 ? ` · ${g.active_orders_count} đang xử lý` : ''})
                      </td>
                      <td
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          color: 'var(--accent-primary)'
                        }}
                      >
                        {money(g.total_spent_vnd)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {g.recent_orders.slice(0, 3).map(ro => (
                            <Link
                              key={ro.order_id}
                              to={`/admin/orders?q=${encodeURIComponent(ro.order_code)}`}
                              className={`admin-badge ${ro.status}`}
                              style={{ fontSize: '10px', textDecoration: 'none' }}
                              title={`${ro.product_title ?? ''} · ${money(ro.total_vnd)}`}
                            >
                              {ro.order_code}
                            </Link>
                          ))}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {g.matched_member_id ? (
                          <button
                            type="button"
                            className="retro-btn retro-btn-amber retro-btn-sm"
                            onClick={() => {
                              setTab('members');
                              void handleOpenCustomer(g.matched_member_id!);
                            }}
                          >
                            <IconLink size={12} />
                            <span>Mở TV & Gộp đơn</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="retro-btn retro-btn-primary retro-btn-sm"
                            onClick={() => openPromoteModal(g)}
                          >
                            <IconUserPlus size={12} />
                            <span>Nâng cấp TV & Gộp đơn</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="admin-pagination-bar">
              <span>
                Tổng cộng: <strong>{guestTotal}</strong> SĐT khách vãng lai · Trang{' '}
                <strong>{guestPageNum}</strong> / <strong>{guestTotalPages}</strong>
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  disabled={guestOffset === 0 || guestLoading}
                  className="retro-btn retro-btn-sm"
                  onClick={() => setGuestOffset(prev => Math.max(0, prev - guestPageSize))}
                >
                  <IconChevronLeft size={14} />
                  <span>Trước</span>
                </button>
                <button
                  type="button"
                  disabled={guestNextOffset === null || guestLoading}
                  className="retro-btn retro-btn-sm"
                  onClick={() => {
                    if (guestNextOffset !== null) setGuestOffset(guestNextOffset);
                  }}
                >
                  <span>Tiếp</span>
                  <IconChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: STAFF MANAGEMENT (SUPER_ADMIN)
         ===================================================================== */}
      {tab === 'staff' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              flexWrap: 'wrap',
              background: 'var(--bg-surface-pure)',
              border: '1.5px solid var(--ink-border)',
              borderRadius: '6px',
              padding: '10px 12px'
            }}
          >
            <div
              style={{
                flex: '1 1 240px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                border: '1.5px solid var(--ink-border)',
                borderRadius: '4px',
                background: 'var(--bg-surface)'
              }}
            >
              <IconSearch size={15} />
              <input
                type="text"
                placeholder="Tìm nhân sự theo username hoặc tên hiển thị..."
                value={staffSearch}
                onChange={e => setStaffSearch(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '13px'
                }}
              />
              {staffSearch && (
                <button type="button" className="retro-icon-btn" onClick={() => setStaffSearch('')}>
                  <IconClose size={13} />
                </button>
              )}
            </div>

            <select
              value={staffRoleFilter}
              onChange={e => setStaffRoleFilter(e.target.value as 'all' | 'SUPER_ADMIN' | 'STAFF')}
              style={{
                padding: '7px 10px',
                border: '1.5px solid var(--ink-border)',
                borderRadius: '4px',
                fontSize: '12px',
                background: 'var(--bg-surface)'
              }}
            >
              <option value="all">Mọi vai trò</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              <option value="STAFF">STAFF</option>
            </select>

            <select
              value={staffActiveFilter}
              onChange={e => setStaffActiveFilter(e.target.value as 'all' | 'active' | 'inactive')}
              style={{
                padding: '7px 10px',
                border: '1.5px solid var(--ink-border)',
                borderRadius: '4px',
                fontSize: '12px',
                background: 'var(--bg-surface)'
              }}
            >
              <option value="all">Mọi trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã vô hiệu hóa</option>
            </select>

            <button
              type="button"
              disabled={staffLoading}
              className={`retro-btn retro-btn-sm ${staffLoading ? 'is-busy' : ''}`}
              onClick={() => void fetchStaff()}
            >
              <IconRefresh size={13} className={staffLoading ? 'retro-spin' : ''} />
              <span>{staffLoading ? 'Đang tải...' : 'Làm mới'}</span>
            </button>
          </div>

          <div className="admin-table-wrap" style={{ position: 'relative' }}>
            <RetroTopProgress
              active={staffLoading && staffList.length > 0}
              label="Đang tải danh sách nhân sự"
            />
            <table
              className={`admin-table ${staffLoading && staffList.length > 0 ? 'is-refreshing-pane' : ''}`}
            >
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Tên hiển thị</th>
                  <th>Vai trò (Role)</th>
                  <th>Trạng thái</th>
                  <th>Đăng nhập gần nhất</th>
                  <th>Ngày tạo</th>
                  <th style={{ textAlign: 'right' }}>Quản trị & Bảo mật</th>
                </tr>
              </thead>
              <tbody>
                {staffLoading && staffList.length === 0 ? (
                  <AdminTableRowsSkeleton columns={7} rows={5} />
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}
                    >
                      Không có nhân sự nào khớp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map(s => {
                    const isSelf = me?.admin_id === s.admin_id;
                    return (
                      <tr key={s.admin_id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                          @{s.username}{' '}
                          {isSelf && (
                            <span style={{ fontSize: '10px', color: 'var(--accent-primary)' }}>
                              (Bạn)
                            </span>
                          )}
                        </td>
                        <td style={{ fontWeight: 600 }}>{s.display_name}</td>
                        <td>
                          <span
                            className={`crm-tag-badge ${s.role === 'SUPER_ADMIN' ? 'VIP' : 'CORPORATE'}`}
                          >
                            {s.role}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`admin-badge ${s.is_active ? 'status-success' : 'status-danger'}`}
                          >
                            {s.is_active ? 'HOẠT ĐỘNG' : 'ĐÃ VÔ HIỆU'}
                          </span>
                        </td>
                        <td
                          style={{
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                            fontFamily: 'var(--font-mono)'
                          }}
                        >
                          {s.last_login_at
                            ? new Date(s.last_login_at).toLocaleString('vi-VN')
                            : 'Chưa đăng nhập'}
                        </td>
                        <td
                          style={{
                            fontSize: '12px',
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-mono)'
                          }}
                        >
                          {new Date(s.created_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                              gap: '6px',
                              flexWrap: 'wrap'
                            }}
                          >
                            <button
                              type="button"
                              className="retro-btn retro-btn-sm"
                              onClick={() => handleOpenEditStaff(s)}
                            >
                              <IconEdit size={12} />
                              <span>Sửa / Cấp lại MK</span>
                            </button>
                            {!isSelf && (
                              <button
                                type="button"
                                disabled={revokingStaffId === s.admin_id}
                                className={`retro-btn retro-btn-danger retro-btn-sm ${revokingStaffId === s.admin_id ? 'is-busy' : ''}`}
                                onClick={() => void handleRevokeStaffSessions(s)}
                                title="Đăng xuất cưỡng bức mọi phiên trình duyệt của nhân sự này"
                              >
                                {revokingStaffId === s.admin_id ? (
                                  <IconSpinner size={12} />
                                ) : (
                                  <IconLogOut size={12} />
                                )}
                                <span>
                                  {revokingStaffId === s.admin_id
                                    ? 'Đang thu hồi...'
                                    : 'Thu hồi phiên'}
                                </span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          CUSTOMER 360° SLIDE-OVER DRAWER
         ===================================================================== */}
      {(selectedCustomer || openingCustomerId) && (
        <div
          className="admin-drawer-backdrop"
          onClick={() => {
            setSelectedCustomer(null);
            setOpeningCustomerId(null);
          }}
        >
          <aside
            className="admin-drawer"
            style={{ position: 'relative' }}
            onClick={e => e.stopPropagation()}
            aria-label="Hồ sơ khách hàng 360 độ"
          >
            <RetroTopProgress
              active={Boolean(openingCustomerId) || savingProfile || linkingOrders}
              label="Đang đồng bộ hồ sơ khách hàng"
            />
            <div className="admin-drawer-header">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <IconUsers size={15} />
                <span>
                  {selectedCustomer
                    ? `CUSTOMER_360 // ${selectedCustomer.full_name.toUpperCase()}`
                    : 'CUSTOMER_360 // ĐANG TẢI HỒ SƠ...'}
                </span>
              </span>
              <button
                type="button"
                className="retro-icon-btn on-dark"
                onClick={() => {
                  setSelectedCustomer(null);
                  setOpeningCustomerId(null);
                }}
                aria-label="Đóng hồ sơ"
              >
                <IconClose size={16} />
              </button>
            </div>

            {!selectedCustomer ? (
              <div className="admin-drawer-body">
                <AdminDetailPaneSkeleton variant="drawer" />
              </div>
            ) : (
              <>
                <div className="admin-drawer-body">
                  {/* Summary Strip inside Drawer */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                      gap: '10px',
                      padding: '12px',
                      background: 'var(--bg-surface-raised)',
                      border: '1.5px solid var(--ink-border)',
                      borderRadius: '6px'
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10.5px',
                          color: 'var(--text-muted)'
                        }}
                      >
                        TỔNG CHI TIÊU
                      </span>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          fontSize: '14px',
                          color: 'var(--accent-primary)'
                        }}
                      >
                        {money(selectedCustomer.total_spent_vnd)}
                      </div>
                    </div>
                    <div>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10.5px',
                          color: 'var(--text-muted)'
                        }}
                      >
                        ĐƠN ĐÃ GIAO / HỦY
                      </span>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          fontSize: '14px'
                        }}
                      >
                        {selectedCustomer.delivered_orders_count ?? 0} giao ·{' '}
                        {selectedCustomer.cancelled_orders_count ?? 0} hủy
                      </div>
                    </div>
                    <div>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10.5px',
                          color: 'var(--text-muted)'
                        }}
                      >
                        TRẠNG THÁI
                      </span>
                      <div>
                        <span
                          className={`admin-badge ${selectedCustomer.is_active ? 'status-success' : 'status-danger'}`}
                        >
                          {selectedCustomer.is_active ? 'HOẠT ĐỘNG' : 'ĐÃ KHÓA'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Unlinked Guest Orders Alert Banner */}
                  {(selectedCustomer.unlinked_phone_orders_count ?? 0) > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '10px',
                        padding: '10px 12px',
                        background: 'var(--accent-amber-light)',
                        border: '1.5px solid var(--ink-border)',
                        borderRadius: '6px',
                        fontSize: '12.5px'
                      }}
                    >
                      <span>
                        Phát hiện{' '}
                        <strong>{selectedCustomer.unlinked_phone_orders_count} đơn vãng lai</strong>{' '}
                        trùng SĐT <strong>{selectedCustomer.phone}</strong> chưa được gộp vào tài
                        khoản này.
                      </span>
                      <button
                        type="button"
                        disabled={linkingOrders}
                        className={`retro-btn retro-btn-primary retro-btn-sm ${linkingOrders ? 'is-busy' : ''}`}
                        onClick={() => void handleLinkPhoneOrders()}
                      >
                        {linkingOrders ? <IconSpinner size={12} /> : <IconLink size={12} />}
                        <span>{linkingOrders ? 'Đang gộp...' : 'Gộp ngay vào hồ sơ'}</span>
                      </button>
                    </div>
                  )}

                  {/* Sub-Tabs inside Drawer */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '6px',
                      borderBottom: '1.5px solid var(--ink-border)',
                      paddingBottom: '8px'
                    }}
                  >
                    <button
                      type="button"
                      className={`retro-btn retro-btn-sm ${drawerTab === 'profile' ? 'retro-btn-primary' : ''}`}
                      onClick={() => setDrawerTab('profile')}
                    >
                      Hồ sơ & Ghi chú CRM
                    </button>
                    <button
                      type="button"
                      className={`retro-btn retro-btn-sm ${drawerTab === 'orders' ? 'retro-btn-primary' : ''}`}
                      onClick={() => setDrawerTab('orders')}
                    >
                      <IconPackage size={13} />
                      <span>Đơn hàng ({selectedCustomer.orders.length})</span>
                    </button>
                    <button
                      type="button"
                      className={`retro-btn retro-btn-sm ${drawerTab === 'chats' ? 'retro-btn-primary' : ''}`}
                      onClick={() => setDrawerTab('chats')}
                    >
                      <IconMessageSquare size={13} />
                      <span>Phiên Chat ({selectedCustomer.chat_sessions?.length ?? 0})</span>
                    </button>
                  </div>

                  {/* Drawer Sub-tab 1: Profile & CRM Notes */}
                  {drawerTab === 'profile' && (
                    <form
                      id="customer-360-profile-form"
                      onSubmit={handleSaveCustomerProfile}
                      style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                    >
                      <div className="admin-grid-2col">
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '12px',
                              fontWeight: 700,
                              marginBottom: '4px'
                            }}
                          >
                            Họ và tên khách hàng *
                          </label>
                          <input
                            required
                            minLength={2}
                            value={profileForm.full_name}
                            onChange={e =>
                              setProfileForm({ ...profileForm, full_name: e.target.value })
                            }
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              border: '1.5px solid var(--ink-border)',
                              borderRadius: '4px',
                              fontSize: '13px'
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '12px',
                              fontWeight: 700,
                              marginBottom: '4px'
                            }}
                          >
                            Nhãn phân loại CRM
                          </label>
                          <select
                            value={profileForm.customer_tag}
                            onChange={e =>
                              setProfileForm({
                                ...profileForm,
                                customer_tag: e.target.value as CustomerTag
                              })
                            }
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              border: '1.5px solid var(--ink-border)',
                              borderRadius: '4px',
                              fontSize: '13px',
                              background: '#fff'
                            }}
                          >
                            {customerTags.map(t => (
                              <option key={t} value={t}>
                                {TAG_LABELS[t]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="admin-grid-2col">
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '12px',
                              fontWeight: 700,
                              marginBottom: '4px'
                            }}
                          >
                            Địa chỉ Email *
                          </label>
                          <input
                            type="email"
                            required
                            value={profileForm.email}
                            onChange={e =>
                              setProfileForm({ ...profileForm, email: e.target.value })
                            }
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              border: '1.5px solid var(--ink-border)',
                              borderRadius: '4px',
                              fontSize: '13px'
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '12px',
                              fontWeight: 700,
                              marginBottom: '4px'
                            }}
                          >
                            Số điện thoại nhận COD
                          </label>
                          <input
                            type="tel"
                            placeholder="0912345678"
                            value={profileForm.phone}
                            onChange={e =>
                              setProfileForm({ ...profileForm, phone: e.target.value })
                            }
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              border: '1.5px solid var(--ink-border)',
                              borderRadius: '4px',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '13px'
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: 700,
                            marginBottom: '4px'
                          }}
                        >
                          Địa chỉ giao hàng mặc định
                        </label>
                        <input
                          placeholder="Số nhà, đường, Phường/Xã, Tỉnh/Thành phố..."
                          value={profileForm.default_shipping_address}
                          onChange={e =>
                            setProfileForm({
                              ...profileForm,
                              default_shipping_address: e.target.value
                            })
                          }
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            border: '1.5px solid var(--ink-border)',
                            borderRadius: '4px',
                            fontSize: '13px'
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: 700,
                            marginBottom: '4px'
                          }}
                        >
                          Ghi chú nội bộ CSKH (Chỉ Admin thấy — tối đa 2000 ký tự)
                        </label>
                        <textarea
                          rows={4}
                          placeholder="VD: Khách ưu tiên giao giờ hành chính, xuất hóa đơn VAT công ty, hoặc lịch sử hẹn giao lại..."
                          value={profileForm.admin_note}
                          onChange={e =>
                            setProfileForm({ ...profileForm, admin_note: e.target.value })
                          }
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            border: '1.5px solid var(--ink-border)',
                            borderRadius: '4px',
                            fontSize: '13px',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                    </form>
                  )}

                  {/* Drawer Sub-tab 2: Orders History */}
                  {drawerTab === 'orders' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedCustomer.orders.length === 0 ? (
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                          Khách hàng chưa có đơn đặt mua nào được gắn với tài khoản.
                        </p>
                      ) : (
                        selectedCustomer.orders.map(o => (
                          <Link
                            key={o.order_id}
                            to={`/admin/orders?q=${encodeURIComponent(o.order_code)}`}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '10px 12px',
                              background: '#fff',
                              border: '1.5px solid var(--ink-border)',
                              borderRadius: '5px',
                              textDecoration: 'none',
                              color: 'inherit'
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  flexWrap: 'wrap'
                                }}
                              >
                                <strong
                                  style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}
                                >
                                  {o.order_code}
                                </strong>
                                <span
                                  className={`admin-badge ${o.status}`}
                                  style={{ fontSize: '10px' }}
                                >
                                  {o.status}
                                </span>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                  {new Date(o.created_at).toLocaleString('vi-VN')}
                                </span>
                              </div>
                              <div
                                style={{ fontSize: '12.5px', fontWeight: 600, marginTop: '3px' }}
                              >
                                {o.product_title || 'Cấu hình Laptop'} {o.sku ? `(${o.sku})` : ''}
                              </div>
                            </div>

                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 800,
                                color: 'var(--accent-primary)'
                              }}
                            >
                              <span>{money(o.total_vnd)}</span>
                              <IconExternalLink size={13} />
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  )}

                  {/* Drawer Sub-tab 3: Linked Chat Sessions */}
                  {drawerTab === 'chats' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {!selectedCustomer.chat_sessions ||
                      selectedCustomer.chat_sessions.length === 0 ? (
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                          Chưa ghi nhận phiên trò chuyện Live Chat nào gắn với tài khoản này.
                        </p>
                      ) : (
                        selectedCustomer.chat_sessions.map(s => (
                          <Link
                            key={s.session_id}
                            to={`/admin/chat?q=${encodeURIComponent(s.session_id.slice(0, 8))}`}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '10px 12px',
                              background: '#fff',
                              border: '1.5px solid var(--ink-border)',
                              borderRadius: '5px',
                              textDecoration: 'none',
                              color: 'inherit',
                              fontSize: '12.5px'
                            }}
                          >
                            <div>
                              <strong style={{ fontFamily: 'var(--font-mono)' }}>
                                Phiên #{s.session_id.slice(0, 8)}
                              </strong>{' '}
                              · {s.messages_count} tin nhắn
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                Cập nhật: {new Date(s.updated_at).toLocaleString('vi-VN')}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {s.needs_human && (
                                <span className="admin-badge WAITING">CHỜ CSKH</span>
                              )}
                              <span className="admin-badge status-info">{s.control_mode}</span>
                              <IconExternalLink size={13} />
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="admin-drawer-footer">
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="retro-btn retro-btn-sm"
                      onClick={() => {
                        setResetPwValue(generateTempPassword(10));
                        setShowResetPw(true);
                        setResetPwTarget(selectedCustomer);
                      }}
                    >
                      <IconKey size={13} />
                      <span>Cấp lại mật khẩu</span>
                    </button>
                    <button
                      type="button"
                      className={`retro-btn retro-btn-sm ${selectedCustomer.is_active ? 'retro-btn-danger' : 'retro-btn-success'}`}
                      onClick={() => setConfirmToggleCustomer(selectedCustomer)}
                    >
                      {selectedCustomer.is_active ? (
                        <IconLock size={13} />
                      ) : (
                        <IconUnlock size={13} />
                      )}
                      <span>{selectedCustomer.is_active ? 'Khóa tài khoản' : 'Mở khóa'}</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="retro-btn"
                      onClick={() => {
                        setSelectedCustomer(null);
                        setOpeningCustomerId(null);
                      }}
                    >
                      Đóng
                    </button>
                    {drawerTab === 'profile' && (
                      <button
                        type="submit"
                        form="customer-360-profile-form"
                        disabled={savingProfile}
                        className={`retro-btn retro-btn-primary ${savingProfile ? 'is-busy' : ''}`}
                      >
                        {savingProfile ? <IconSpinner size={14} /> : <IconCheck size={14} />}
                        <span>{savingProfile ? 'Đang lưu...' : 'Lưu hồ sơ CRM'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {/* =====================================================================
          MODAL: CREATE NEW MEMBER CUSTOMER
         ===================================================================== */}
      {showCreateMemberModal && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !creatingMember && setShowCreateMemberModal(false)}
        >
          <div
            className="admin-modal-box"
            style={{ maxWidth: '540px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="retro-window-header">
              <span>TẠO HỒ SƠ KHÁCH HÀNG THÀNH VIÊN MỚI</span>
              <button
                type="button"
                disabled={creatingMember}
                className="retro-icon-btn on-dark"
                onClick={() => setShowCreateMemberModal(false)}
              >
                <IconClose size={14} />
              </button>
            </div>

            <form
              onSubmit={handleCreateMember}
              className="admin-modal-body"
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div className="admin-grid-2col">
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      marginBottom: '4px'
                    }}
                  >
                    Họ tên khách hàng *
                  </label>
                  <input
                    required
                    minLength={2}
                    placeholder="Nguyễn Văn A"
                    value={createMemberForm.full_name}
                    onChange={e =>
                      setCreateMemberForm({ ...createMemberForm, full_name: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1.5px solid var(--ink-border)',
                      borderRadius: '4px',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      marginBottom: '4px'
                    }}
                  >
                    Phân loại CRM
                  </label>
                  <select
                    value={createMemberForm.customer_tag}
                    onChange={e =>
                      setCreateMemberForm({
                        ...createMemberForm,
                        customer_tag: e.target.value as CustomerTag
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1.5px solid var(--ink-border)',
                      borderRadius: '4px',
                      fontSize: '13px',
                      background: '#fff'
                    }}
                  >
                    {customerTags.map(t => (
                      <option key={t} value={t}>
                        {TAG_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-grid-2col">
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      marginBottom: '4px'
                    }}
                  >
                    Email đăng nhập *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="khachhang@example.com"
                    value={createMemberForm.email}
                    onChange={e =>
                      setCreateMemberForm({ ...createMemberForm, email: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1.5px solid var(--ink-border)',
                      borderRadius: '4px',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      marginBottom: '4px'
                    }}
                  >
                    Số điện thoại nhận COD
                  </label>
                  <input
                    type="tel"
                    placeholder="0912345678"
                    value={createMemberForm.phone}
                    onChange={e =>
                      setCreateMemberForm({ ...createMemberForm, phone: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1.5px solid var(--ink-border)',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '4px'
                  }}
                >
                  Mật khẩu khởi tạo (tối thiểu 8 ký tự) *
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      border: '1.5px solid var(--ink-border)',
                      borderRadius: '4px',
                      background: '#fff',
                      paddingRight: '6px'
                    }}
                  >
                    <input
                      type={showCreateMemberPw ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={createMemberForm.password}
                      onChange={e =>
                        setCreateMemberForm({ ...createMemberForm, password: e.target.value })
                      }
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        border: 'none',
                        outline: 'none',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px'
                      }}
                    />
                    <button
                      type="button"
                      className="retro-icon-btn"
                      onClick={() => setShowCreateMemberPw(v => !v)}
                    >
                      {showCreateMemberPw ? <IconEyeOff size={14} /> : <IconEye size={14} />}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="retro-btn retro-btn-sm"
                    onClick={() =>
                      setCreateMemberForm({
                        ...createMemberForm,
                        password: generateTempPassword(10)
                      })
                    }
                  >
                    Tạo ngẫu nhiên
                  </button>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '4px'
                  }}
                >
                  Địa chỉ giao hàng mặc định
                </label>
                <input
                  placeholder="Số nhà, đường, Phường/Xã, Tỉnh/Thành phố..."
                  value={createMemberForm.default_shipping_address}
                  onChange={e =>
                    setCreateMemberForm({
                      ...createMemberForm,
                      default_shipping_address: e.target.value
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '4px'
                  }}
                >
                  Ghi chú nội bộ
                </label>
                <textarea
                  rows={2}
                  value={createMemberForm.admin_note}
                  onChange={e =>
                    setCreateMemberForm({ ...createMemberForm, admin_note: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                />
              </div>

              <label className="admin-checkbox-row" style={{ fontSize: '12.5px', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={createMemberForm.link_guest_orders}
                  onChange={e =>
                    setCreateMemberForm({
                      ...createMemberForm,
                      link_guest_orders: e.target.checked
                    })
                  }
                />
                <span>
                  Tự động gộp các đơn COD vãng lai có cùng số điện thoại vào tài khoản này
                </span>
              </label>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  paddingTop: '4px'
                }}
              >
                <button
                  type="button"
                  disabled={creatingMember}
                  className="retro-btn"
                  onClick={() => setShowCreateMemberModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingMember}
                  className={`retro-btn retro-btn-primary ${creatingMember ? 'is-busy' : ''}`}
                >
                  {creatingMember && <IconSpinner size={14} />}
                  <span>{creatingMember ? 'Đang tạo...' : 'Tạo hồ sơ thành viên'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: PROMOTE GUEST BUYER TO MEMBER
         ===================================================================== */}
      {promoteTarget && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !promotingGuest && setPromoteTarget(null)}
        >
          <div
            className="admin-modal-box"
            style={{ maxWidth: '520px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="retro-window-header">
              <span>NÂNG CẤP KHÁCH VÃNG LAI ({promoteTarget.phone}) LÊN THÀNH VIÊN</span>
              <button
                type="button"
                disabled={promotingGuest}
                className="retro-icon-btn on-dark"
                onClick={() => setPromoteTarget(null)}
              >
                <IconClose size={14} />
              </button>
            </div>

            <form
              onSubmit={handlePromoteGuest}
              className="admin-modal-body"
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div
                style={{
                  padding: '10px 12px',
                  background: 'var(--accent-amber-light)',
                  border: '1px solid var(--ink-border)',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              >
                Toàn bộ <strong>{promoteTarget.orders_count} đơn hàng COD vãng lai</strong> của SĐT{' '}
                <strong>{promoteTarget.phone}</strong> sẽ được gộp tự động vào hồ sơ thành viên mới.
              </div>

              <div className="admin-grid-2col">
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      marginBottom: '4px'
                    }}
                  >
                    Họ tên khách hàng *
                  </label>
                  <input
                    required
                    value={promoteForm.full_name}
                    onChange={e => setPromoteForm({ ...promoteForm, full_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1.5px solid var(--ink-border)',
                      borderRadius: '4px',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      marginBottom: '4px'
                    }}
                  >
                    Nhãn CRM khởi tạo
                  </label>
                  <select
                    value={promoteForm.customer_tag}
                    onChange={e =>
                      setPromoteForm({
                        ...promoteForm,
                        customer_tag: e.target.value as CustomerTag
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1.5px solid var(--ink-border)',
                      borderRadius: '4px',
                      fontSize: '13px',
                      background: '#fff'
                    }}
                  >
                    {customerTags.map(t => (
                      <option key={t} value={t}>
                        {TAG_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '4px'
                  }}
                >
                  Địa chỉ Email cấp tài khoản *
                </label>
                <input
                  type="email"
                  required
                  placeholder="Nhập email của khách hàng để tạo tài khoản..."
                  value={promoteForm.email}
                  onChange={e => setPromoteForm({ ...promoteForm, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '4px'
                  }}
                >
                  Mật khẩu khởi tạo (tối thiểu 8 ký tự) *
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      border: '1.5px solid var(--ink-border)',
                      borderRadius: '4px',
                      background: '#fff',
                      paddingRight: '6px'
                    }}
                  >
                    <input
                      type={showPromotePw ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={promoteForm.password}
                      onChange={e => setPromoteForm({ ...promoteForm, password: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        border: 'none',
                        outline: 'none',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px'
                      }}
                    />
                    <button
                      type="button"
                      className="retro-icon-btn"
                      onClick={() => setShowPromotePw(v => !v)}
                    >
                      {showPromotePw ? <IconEyeOff size={14} /> : <IconEye size={14} />}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="retro-btn retro-btn-sm"
                    onClick={() => void navigator.clipboard?.writeText(promoteForm.password)}
                    title="Sao chép mật khẩu để gửi khách"
                  >
                    <IconCopy size={13} />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '4px'
                  }}
                >
                  Địa chỉ mặc định
                </label>
                <input
                  value={promoteForm.default_shipping_address}
                  onChange={e =>
                    setPromoteForm({ ...promoteForm, default_shipping_address: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  paddingTop: '4px'
                }}
              >
                <button
                  type="button"
                  disabled={promotingGuest}
                  className="retro-btn"
                  onClick={() => setPromoteTarget(null)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={promotingGuest}
                  className={`retro-btn retro-btn-primary ${promotingGuest ? 'is-busy' : ''}`}
                >
                  {promotingGuest && <IconSpinner size={14} />}
                  <span>{promotingGuest ? 'Đang nâng cấp...' : 'Tạo thành viên & Gộp đơn'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: RESET CUSTOMER PASSWORD
         ===================================================================== */}
      {resetPwTarget && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !resettingPw && setResetPwTarget(null)}
        >
          <div
            className="admin-modal-box"
            style={{ maxWidth: '460px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="retro-window-header">
              <span>CẤP LẠI MẬT KHẨU KHÁCH HÀNG</span>
              <button
                type="button"
                className="retro-icon-btn on-dark"
                onClick={() => setResetPwTarget(null)}
              >
                <IconClose size={14} />
              </button>
            </div>
            <form
              onSubmit={handleResetCustomerPassword}
              className="admin-modal-body"
              style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}
            >
              <p style={{ margin: 0 }}>
                Đặt lại mật khẩu mới cho tài khoản <strong>{resetPwTarget.email}</strong>. Toàn bộ
                phiên đăng nhập cũ của khách hàng sẽ tự động đăng xuất để bảo mật.
              </p>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '4px',
                    background: '#fff',
                    paddingRight: '6px'
                  }}
                >
                  <input
                    type={showResetPw ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={resetPwValue}
                    onChange={e => setResetPwValue(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      border: 'none',
                      outline: 'none',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px'
                    }}
                  />
                  <button
                    type="button"
                    className="retro-icon-btn"
                    onClick={() => setShowResetPw(v => !v)}
                  >
                    {showResetPw ? <IconEyeOff size={14} /> : <IconEye size={14} />}
                  </button>
                </div>
                <button
                  type="button"
                  className="retro-btn retro-btn-sm"
                  onClick={() => void navigator.clipboard?.writeText(resetPwValue)}
                >
                  <IconCopy size={13} />
                  <span>Copy</span>
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="retro-btn" onClick={() => setResetPwTarget(null)}>
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={resettingPw}
                  className={`retro-btn retro-btn-primary ${resettingPw ? 'is-busy' : ''}`}
                >
                  {resettingPw && <IconSpinner size={14} />}
                  <span>{resettingPw ? 'Đang lưu...' : 'Xác nhận đặt lại mật khẩu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: CONFIRM LOCK / UNLOCK CUSTOMER
         ===================================================================== */}
      {confirmToggleCustomer && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !toggleCustomerBusy && setConfirmToggleCustomer(null)}
        >
          <div
            className="admin-modal-box"
            style={{ maxWidth: '460px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="retro-window-header">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <IconAlertTriangle size={15} />
                <span>
                  XÁC NHẬN {confirmToggleCustomer.is_active ? 'KHÓA' : 'MỞ KHÓA'} TÀI KHOẢN
                </span>
              </span>
              <button
                type="button"
                disabled={toggleCustomerBusy}
                onClick={() => setConfirmToggleCustomer(null)}
                className="retro-icon-btn on-dark"
              >
                <IconClose size={14} />
              </button>
            </div>
            <div
              className="admin-modal-body"
              style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}
            >
              <p style={{ margin: 0, lineHeight: 1.5 }}>
                {confirmToggleCustomer.is_active ? (
                  <>
                    Bạn có chắc chắn muốn <strong>KHÓA</strong> tài khoản thành viên{' '}
                    <strong>{confirmToggleCustomer.email}</strong>? Mọi phiên đăng nhập hiện tại của
                    khách sẽ bị thu hồi ngay lập tức.
                  </>
                ) : (
                  <>
                    Bạn có chắc chắn muốn <strong>MỞ KHÓA</strong> tài khoản thành viên{' '}
                    <strong>{confirmToggleCustomer.email}</strong> để khách đăng nhập trở lại?
                  </>
                )}
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  disabled={toggleCustomerBusy}
                  onClick={() => setConfirmToggleCustomer(null)}
                  className="retro-btn"
                >
                  HỦY
                </button>
                <button
                  type="button"
                  disabled={toggleCustomerBusy}
                  onClick={() => void executeToggleCustomerActive()}
                  className={`retro-btn ${confirmToggleCustomer.is_active ? 'retro-btn-danger' : 'retro-btn-success'} ${toggleCustomerBusy ? 'is-busy' : ''}`}
                >
                  {toggleCustomerBusy && <IconSpinner size={14} />}
                  <span>
                    {toggleCustomerBusy
                      ? 'ĐANG XỬ LÝ...'
                      : confirmToggleCustomer.is_active
                        ? 'XÁC NHẬN KHÓA'
                        : 'XÁC NHẬN MỞ KHÓA'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: SELF-SERVICE ADMIN OWN PASSWORD CHANGE (ALL ROLES)
         ===================================================================== */}
      {showOwnPwModal && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !savingOwnPw && setShowOwnPwModal(false)}
        >
          <div
            className="admin-modal-box"
            style={{ maxWidth: '460px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="retro-window-header">
              <span>ĐỔI MẬT KHẨU QUẢN TRỊ CÁ NHÂN ({me?.username ?? ''})</span>
              <button
                type="button"
                className="retro-icon-btn on-dark"
                onClick={() => setShowOwnPwModal(false)}
              >
                <IconClose size={14} />
              </button>
            </div>
            <form
              onSubmit={handleChangeOwnPassword}
              className="admin-modal-body"
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '4px'
                  }}
                >
                  Mật khẩu hiện tại *
                </label>
                <input
                  type={showOwnPwText ? 'text' : 'password'}
                  required
                  value={oldOwnPw}
                  onChange={e => setOldOwnPw(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '4px'
                  }}
                >
                  Mật khẩu mới (tối thiểu {STAFF_MIN_PASSWORD_LENGTH} ký tự) *
                </label>
                <input
                  type={showOwnPwText ? 'text' : 'password'}
                  required
                  minLength={STAFF_MIN_PASSWORD_LENGTH}
                  value={newOwnPw}
                  onChange={e => setNewOwnPw(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '4px'
                  }}
                >
                  Nhập lại mật khẩu mới *
                </label>
                <input
                  type={showOwnPwText ? 'text' : 'password'}
                  required
                  minLength={STAFF_MIN_PASSWORD_LENGTH}
                  value={confirmOwnPw}
                  onChange={e => setConfirmOwnPw(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                />
              </div>

              <label className="admin-checkbox-row" style={{ fontSize: '12px' }}>
                <input
                  type="checkbox"
                  checked={showOwnPwText}
                  onChange={e => setShowOwnPwText(e.target.checked)}
                />
                <span>Hiển thị ký tự mật khẩu</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="retro-btn"
                  onClick={() => setShowOwnPwModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingOwnPw}
                  className={`retro-btn retro-btn-primary ${savingOwnPw ? 'is-busy' : ''}`}
                >
                  {savingOwnPw && <IconSpinner size={14} />}
                  <span>{savingOwnPw ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: ADD STAFF & EDIT STAFF
         ===================================================================== */}
      {showAddStaffModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowAddStaffModal(false)}>
          <div
            className="admin-modal-box"
            style={{ maxWidth: '480px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="retro-window-header">
              <span>THÊM TÀI KHOẢN NHÂN SỰ VẬN HÀNH</span>
              <button
                type="button"
                onClick={() => setShowAddStaffModal(false)}
                className="retro-icon-btn on-dark"
              >
                <IconClose size={14} />
              </button>
            </div>

            <form
              onSubmit={handleCreateStaff}
              className="admin-modal-body"
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '4px'
                  }}
                >
                  Tên đăng nhập (username) *
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  placeholder="staff_linh, admin_kho..."
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '4px'
                  }}
                >
                  Tên hiển thị *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Linh (CSKH), Quản lý Kho..."
                  value={newDisplayName}
                  onChange={e => setNewDisplayName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '4px'
                  }}
                >
                  Mật khẩu ban đầu (tối thiểu {STAFF_MIN_PASSWORD_LENGTH} ký tự) *
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '4px',
                    background: '#fff',
                    paddingRight: '6px'
                  }}
                >
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={STAFF_MIN_PASSWORD_LENGTH}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      border: 'none',
                      outline: 'none',
                      fontSize: '13px'
                    }}
                  />
                  <button
                    type="button"
                    className="retro-icon-btn"
                    onClick={() => setShowNewPassword(v => !v)}
                  >
                    {showNewPassword ? <IconEyeOff size={15} /> : <IconEye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '4px'
                  }}
                >
                  Vai trò phân quyền
                </label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as 'SUPER_ADMIN' | 'STAFF')}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '4px',
                    fontSize: '13px',
                    background: '#fff'
                  }}
                >
                  <option value="STAFF">STAFF — Vận hành đơn hàng, kho & CSKH</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN — Toàn quyền hệ thống & nhân sự</option>
                </select>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  paddingTop: '4px'
                }}
              >
                <button
                  type="button"
                  className="retro-btn"
                  onClick={() => setShowAddStaffModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={addStaffBusy}
                  className={`retro-btn retro-btn-primary ${addStaffBusy ? 'is-busy' : ''}`}
                >
                  {addStaffBusy && <IconSpinner size={14} />}
                  <span>{addStaffBusy ? 'Đang tạo...' : 'Tạo nhân sự'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingStaff && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !editStaffBusy && setEditingStaff(null)}
        >
          <div
            className="admin-modal-box"
            style={{ maxWidth: '480px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="retro-window-header">
              <span>CHỈNH SỬA NHÂN SỰ: @{editingStaff.username}</span>
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="retro-icon-btn on-dark"
              >
                <IconClose size={14} />
              </button>
            </div>

            <form
              onSubmit={handleSaveStaffEdit}
              className="admin-modal-body"
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '4px'
                  }}
                >
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  required
                  value={editDisplayName}
                  onChange={e => setEditDisplayName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '4px'
                  }}
                >
                  Vai trò phân quyền
                </label>
                <select
                  value={editRole}
                  onChange={e => setEditRole(e.target.value as 'SUPER_ADMIN' | 'STAFF')}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '4px',
                    fontSize: '13px',
                    background: '#fff'
                  }}
                >
                  <option value="STAFF">STAFF — Vận hành đơn, kho & CSKH</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN — Toàn quyền hệ thống</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '4px'
                  }}
                >
                  Đặt lại mật khẩu mới (bỏ trống nếu giữ nguyên)
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '4px',
                    background: '#fff',
                    paddingRight: '6px'
                  }}
                >
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    placeholder={`Tối thiểu ${STAFF_MIN_PASSWORD_LENGTH} ký tự...`}
                    value={editPassword}
                    onChange={e => setEditPassword(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      border: 'none',
                      outline: 'none',
                      fontSize: '13px'
                    }}
                  />
                  <button
                    type="button"
                    className="retro-icon-btn"
                    onClick={() => setShowEditPassword(v => !v)}
                  >
                    {showEditPassword ? <IconEyeOff size={15} /> : <IconEye size={15} />}
                  </button>
                </div>
              </div>

              <label className="admin-checkbox-row" style={{ fontSize: '13px', fontWeight: 700 }}>
                <input
                  type="checkbox"
                  checked={editIsActive}
                  disabled={me?.admin_id === editingStaff.admin_id}
                  onChange={e => setEditIsActive(e.target.checked)}
                />
                <span>Cho phép tài khoản này đăng nhập vận hành</span>
              </label>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  paddingTop: '4px'
                }}
              >
                <button type="button" className="retro-btn" onClick={() => setEditingStaff(null)}>
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={editStaffBusy}
                  className={`retro-btn retro-btn-primary ${editStaffBusy ? 'is-busy' : ''}`}
                >
                  {editStaffBusy && <IconSpinner size={14} />}
                  <span>{editStaffBusy ? 'Đang lưu...' : 'Lưu cập nhật'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
