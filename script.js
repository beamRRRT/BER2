document.addEventListener('DOMContentLoaded', () => {
    // --- 1. ส่วน Animation (ค่อยๆ ลอยขึ้นมาเมื่อ Scroll ถึง) ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in-up').forEach((el) => {
        observer.observe(el);
    });

    // --- 2. เรียกตรวจสอบ Popup ทันทีที่โหลดเว็บ ---
    checkPopupStatus();
});

// --- ฟังก์ชันตรวจสอบสถานะ Popup ---
function checkPopupStatus() {
    // เลือกตั้งสภานักเรียน: แสดง Popup ทุกครั้งที่เข้าเว็บ หรือทุก 30 นาที
    console.log("ANC Dev: กำลังเตรียมแสดง Popup เลือกตั้งสภานักเรียน...");
    showElectionPopup();
    
    // ตั้ง Timer เพื่อแสดง Popup อีกครั้งทุก 30 นาที
    setInterval(() => {
        showElectionPopup();
    }, 30 * 60 * 1000);
}

function showElectionPopup() {
    setTimeout(() => {
        const modalEl = document.getElementById('specialPolicyModal');
        if(modalEl) {
            const myModal = new bootstrap.Modal(modalEl);
            myModal.show();
            
            // เพิ่มเสียงเตือนการเลือก (ถ้ามี)
            playNotificationSound();
        }
    }, 1500);
}

function playNotificationSound() {
    // สร้างเสียง notification ด้วย Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch(e) {
        // ถ้า Web Audio API ไม่พร้อมใช้งาน ก็ไม่ต้องเสียง
    }
}

// --- ฟังก์ชันปิด Popup (ใช้เมื่อกดปุ่ม "รับทราบ" หรือ "ดูนโยบาย") ---
function closePopupSimple() {
    // สำหรับเลือกตั้ง: ไม่บันทึกสถานะการปิด เพื่อให้ Popup แสดงได้บ่อยๆ
    console.log("ANC Dev: ปิด Popup เลือกตั้ง (จะแสดงอีกครั้งทันที)");

    // 1. สั่งปิด Modal ผ่าน Bootstrap Instance
    const modalEl = document.getElementById('specialPolicyModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    
    if (modalInstance) {
        modalInstance.hide(); 
    }

    // 2. บังคับปลดล็อคหน้าจอ (แก้ปัญหา Scroll ไม่ได้หลังจากปิด Modal)
    setTimeout(() => {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';

        // ลบฉากหลังสีดำ (Backdrop) ที่อาจค้างอยู่
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
    }, 300);
}

// --- สำหรับ Developer (ปุ่ม Reset เพื่อทดสอบ) ---
function resetPopupTimer() {
    sessionStorage.removeItem('ancPopupClosed');
    localStorage.removeItem('ancPopupHiddenUntil'); // ล้างค่าเก่าเผื่อมีค้างในเครื่อง
    alert("Dev: ล้างค่าการแสดงผลแล้ว! ระบบจะรีโหลดเพื่อแสดง Popup ใหม่");
    location.reload(); 
}
function checkPopupStatus() {
    const popupCooldown = 3 * 60 * 1000; // 3 นาที
    const lastShown = localStorage.getItem('ancPopupLastShown');
    const now = Date.now();

    // เงื่อนไข: ถ้ายังไม่เคยแสดงเลย OR (เวลาผ่านไปเกิน 3 นาที AND เป็นการเปิดหน้าเว็บใหม่)
    // การเช็ค SessionStorage ช่วยให้มั่นใจว่าถ้ารีเฟรชจะขึ้นทันทีตามที่คุณต้องการ
    if (!sessionStorage.getItem('ancPopupShownThisSession') || (lastShown && now - lastShown > popupCooldown)) {
        showElectionPopup();
    }
}

function showElectionPopup() {
    setTimeout(() => {
        const modalEl = document.getElementById('specialPolicyModal');
        if(modalEl) {
            const myModal = new bootstrap.Modal(modalEl);
            myModal.show();
            
            // บันทึกเวลาที่แสดง และสถานะ Session
            localStorage.setItem('ancPopupLastShown', Date.now());
            sessionStorage.setItem('ancPopupShownThisSession', 'true');
            
            // ลบ playNotificationSound() ออกตามคำขอ (ไม่มีเสียง)
        }
    }, 1200); // ดีเลย์เล็กน้อยให้หน้าเว็บโหลดเสร็จก่อนลอยขึ้นมา
}

function closePopupSimple() {
    const modalEl = document.getElementById('specialPolicyModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) {
        modalInstance.hide(); 
    }
    
    // Cleanup จัดการเรื่อง Scroll ค้าง
    setTimeout(() => {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
    }, 300);
}