// client/src/components/layout/RoleGuard.jsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';

export function RoleGuard({ allowedRoles, children, fallback = null }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    if (fallback) return fallback;

    return (
      <div className="p-8">
        <EmptyState
          icon={ShieldAlert}
          title="Access Restricted"
          description={`Your role (${user.role}) does not have permission to view or execute actions on this screen. Required: ${allowedRoles.join(' or ')}.`}
          action={
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          }
        />
      </div>
    );
  }

  return <>{children}</>;
}
