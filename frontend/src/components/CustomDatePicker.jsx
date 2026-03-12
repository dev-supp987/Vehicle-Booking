import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

const CustomInput = forwardRef(({ value, onClick, placeholder }, ref) => (
    <div className="custom-date-input-container" onClick={onClick} ref={ref} style={{ position: 'relative', width: '100%', cursor: 'pointer' }}>
        <input
            value={value}
            readOnly
            className="form-control"
            style={{
                width: '100%',
                padding: '0.7rem 1rem 0.7rem 2.8rem',
                marginTop: '0.4rem',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'var(--transition)'
            }}
            placeholder={placeholder}
        />
        <Calendar
            size={18}
            style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(15%)',
                color: 'var(--primary)',
                pointerEvents: 'none'
            }}
        />
    </div>
));

const CustomDatePicker = ({ selected, onChange, placeholderText, minDate, showTimeSelect = true }) => {
    return (
        <div className="custom-date-picker-wrapper" style={{ width: '100%' }}>
            <DatePicker
                selected={selected}
                onChange={onChange}
                showTimeSelect={showTimeSelect}
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMM d, yyyy h:mm aa"
                placeholderText={placeholderText}
                minDate={minDate}
                customInput={<CustomInput />}
                showPopperArrow={false}
                calendarClassName="shadow-lg border-0"
                popperClassName="custom-datepicker-popper"
                portalId="root"
                popperPlacement="bottom-start"
            />
        </div>
    );
};

export default CustomDatePicker;
