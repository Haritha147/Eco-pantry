import React from 'react';
import { useAppContext } from '../context/AppContext';
import { AlertCircle, Lock, Sparkles, ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VerifyPage = () => {
    const { authError, authLoading, otpArray, verificationEmail, demoOtp, otpTimer, resendActive, verifySuccess, setAuthView, handleVerifySubmit, handleOtpChange, handleOtpKeyDown, handleResendOtp, renderToast } = useAppContext();
    const navigate = useNavigate();

    return (
        <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
            <div className="auth-fullscreen-container">
        {renderToast()}
        <div className="auth-decor-blob green"></div>
        <div className="auth-decor-blob teal"></div>
        
        <div className="glass-panel auth-card otp-card">
          <button className="back-auth-btn" onClick={() => setAuthView('login')}>
            <ArrowLeft size={16} /> Back to login
          </button>
          
          <div className="auth-header">
            <div className={`otp-shield-icon ${verifySuccess ? 'success' : ''}`}>
              {verifySuccess ? <CheckCircle size={40} /> : <Lock size={40} />}
            </div>
            <h1 className="auth-title">Verify Account</h1>
            <p className="auth-subtitle">We sent a verification code to <br/><strong style={{ color: 'var(--accent-teal)' }}>{verificationEmail}</strong></p>
          </div>

          {verifySuccess ? (
            <div className="otp-success-message">
              <h3>Verification Successful!</h3>
              <p>Entering your eco-dashboard...</p>
            </div>
          ) : (
            <>
              {authError && (
                <div className="auth-error-box">
                  <AlertCircle size={16} />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleVerifySubmit} className="otp-form">
                <div className="otp-input-grid">
                  {otpArray.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-input-${i}`}
                      type="text"
                      maxLength={1}
                      className="otp-box"
                      value={digit}
                      onChange={e => handleOtpChange(e.target.value, i)}
                      onKeyDown={e => handleOtpKeyDown(e, i)}
                      autoComplete="off"
                    />
                  ))}
                </div>

                <button className="auth-btn btn-primary" type="submit" disabled={authLoading}>
                  {authLoading ? <div className="loader-spinner"></div> : 'Confirm Code'}
                </button>
              </form>

              <div className="otp-timer-section">
                {resendActive ? (
                  <button className="resend-link-btn" onClick={handleResendOtp} disabled={authLoading}>
                    <RefreshCw size={14} /> Resend OTP Code
                  </button>
                ) : (
                  <span className="timer-text">
                    Resend code in <strong style={{ color: 'var(--accent-green)' }}>{Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}</strong>
                  </span>
                )}
              </div>

              {demoOtp && (
                <div className="demo-otp-banner">
                  <Sparkles size={16} color="var(--warning)" />
                  <span>Demo Mode: Code is <strong style={{ color: 'var(--text-primary)' }}>{demoOtp}</strong></span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
    );
};

export default VerifyPage;
