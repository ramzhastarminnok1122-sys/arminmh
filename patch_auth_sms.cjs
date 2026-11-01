const fs = require('fs');

let auth = fs.readFileSync('src/pages/Auth.jsx', 'utf8');

const newErrorLogic = `
        const status = errorData?.data?.return?.status;
        let errStr = errorData?.data?.return?.message || errorData?.data?.entries?.[0]?.statustext || errorData?.error || 'ارتباط با سرور پیامک برقرار نشد';
        
        if (status === 412) {
          errStr = 'خطا 412: خط فرستنده نامعتبر است! در تنظیمات لیارا متغیر محیطی KAVENEGAR_SENDER را مساوی با شماره خط اختصاصی خود (مثلا 10008663) قرار دهید.';
        } else if (status === 411) {
          errStr = 'خطا 411: شماره شما در بلک‌لیست مخابرات است (ارسال تبلیغاتی بسته است).';
        } else if (status === 431) {
          errStr = 'خطا 431: ساختار پیامک اشتباه است.';
        } else if (status === 432) {
          errStr = 'خطا 432: پارامتر گیرنده در پیامک نامعتبر است.';
        } else if (status === 401 || status === 403) {
          errStr = 'خطا دسترسی: کلید API کاوه‌نگار در سرور نامعتبر یا منقضی شده است.';
        } else if (status) {
          errStr = errStr + ' (کد خطا: ' + status + ')';
        }
        
        toast('پیام کاوه‌نگار: ' + errStr, 'error');
`;

auth = auth.replace(
  /let errStr = errorData\?\.data\?\.return\?\.message[\s\S]*?toast\('پیام کاوه‌نگار: ' \+ errStr, 'error'\);/,
  newErrorLogic
);

fs.writeFileSync('src/pages/Auth.jsx', auth);
