"use client";

import React, { useEffect, useRef, useCallback } from 'react';

interface GlobeEngineProps {
    size?: number;
    dotColor?: string;
    arcColor?: string;
    markerColor?: string;
    selectedCountry: any;
    activeTopicId: string;
    countriesData: any[];
}

export default function GlobeEngine({
    size = 800,
    dotColor = "rgba(100, 180, 255, ALPHA)",
    arcColor = "rgba(99, 102, 241, 0.2)",
    markerColor = "rgba(129, 140, 248, 1)",
    selectedCountry,
    activeTopicId,
    countriesData
}: GlobeEngineProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rotYRef = useRef(0.4);
    const rotXRef = useRef(0.2);
    const dragRef = useRef({ active: false, startX: 0, startY: 0, startRotY: 0, startRotX: 0 });
    const animRef = useRef(0);
    const timeRef = useRef(0);
    const dotsRef = useRef<number[][]>([]);

    const targetRotRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });
    const isTargeting = useRef(false);

    useEffect(() => {
        const dots = [];
        const numDots = 1500;
        const goldenRatio = (1 + Math.sqrt(5)) / 2;
        for (let i = 0; i < numDots; i++) {
            const theta = (2 * Math.PI * i) / goldenRatio;
            const phi = Math.acos(1 - (2 * (i + 0.5)) / numDots);
            dots.push([Math.cos(theta) * Math.sin(phi), Math.cos(phi), Math.sin(theta) * Math.sin(phi)]);
        }
        dotsRef.current = dots;
    }, []);

    useEffect(() => {
        if (selectedCountry) {
            // latLngToXYZ 렌더링 함수에 맞춰 최적의 타겟 회전각(radian) 계산
            // XYZ 투영 시 lng(경도)는 Z/X축 회전(rotY)에, lat(위도)는 Y/Z축 회전(rotX)에 관여함.
            // 정면이 보이도록 위상 오프셋 조절
            const targetY = -((selectedCountry.lng + 180) * Math.PI) / 180 - Math.PI / 2;
            const targetX = (selectedCountry.lat * Math.PI) / 180;

            targetRotRef.current = { y: targetY, x: targetX };
            isTargeting.current = true;
        } else {
            isTargeting.current = false;
        }
    }, [selectedCountry]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);

        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) * 0.42;
        const fov = 800;

        if (!dragRef.current.active) {
            if (isTargeting.current && targetRotRef.current.y !== null && targetRotRef.current.x !== null) {
                // 부드러운 회전을 위한 보간법(Lerp) 적용
                // 각도 차이 보정 (-PI ~ PI 유지)
                let diffY = targetRotRef.current.y - rotYRef.current;
                while (diffY < -Math.PI) diffY += Math.PI * 2;
                while (diffY > Math.PI) diffY -= Math.PI * 2;

                rotYRef.current += diffY * 0.08; // 속도 살짝 증가

                let diffX = targetRotRef.current.x - rotXRef.current;
                rotXRef.current += diffX * 0.08;

                // 목표치에 거의 도달하면 Targeting 종료
                if (Math.abs(diffY) < 0.005 && Math.abs(diffX) < 0.005) {
                    isTargeting.current = false;
                }
            } else {
                rotYRef.current += 0.002; // 기본 자전 속도 약간 증가
            }
        }

        timeRef.current += 0.015;
        const time = timeRef.current;
        ctx.clearRect(0, 0, w, h);

        const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.5);
        glowGrad.addColorStop(0, "rgba(60, 140, 255, 0.05)");
        glowGrad.addColorStop(1, "rgba(60, 140, 255, 0)");
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, w, h);

        const ry = rotYRef.current;
        const rx = rotXRef.current;

        const rotateY = (x: number, y: number, z: number, angle: number) => [x * Math.cos(angle) + z * Math.sin(angle), y, -x * Math.sin(angle) + z * Math.cos(angle)];
        const rotateX = (x: number, y: number, z: number, angle: number) => [x, y * Math.cos(angle) - z * Math.sin(angle), y * Math.sin(angle) + z * Math.cos(angle)];
        const project = (x: number, y: number, z: number, cx: number, cy: number, fov: number) => {
            const scale = fov / (fov + z);
            return [x * scale + cx, y * scale + cy, z];
        };
        const latLngToXYZ = (lat: number, lng: number, radius: number) => {
            const phi = ((90 - lat) * Math.PI) / 180;
            const theta = ((lng + 180) * Math.PI) / 180;
            return [-(radius * Math.sin(phi) * Math.cos(theta)), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta)];
        };

        dotsRef.current.forEach(dot => {
            let [x, y, z] = [dot[0] * radius, dot[1] * radius, dot[2] * radius];
            [x, y, z] = rotateX(x, y, z, rx);
            [x, y, z] = rotateY(x, y, z, ry);
            if (z <= 0) {
                const [sx, sy] = project(x, y, z, cx, cy, fov);
                const depthAlpha = Math.max(0.1, 1 - (z + radius) / (2 * radius));
                ctx.beginPath();
                ctx.arc(sx, sy, 1.2 + depthAlpha * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = dotColor.replace("ALPHA", (depthAlpha * 0.7).toFixed(2));
                ctx.fill();
            }
        });

        countriesData.forEach(country => {
            let [x, y, z] = latLngToXYZ(country.lat, country.lng, radius);
            [x, y, z] = rotateX(x, y, z, rx);
            [x, y, z] = rotateY(x, y, z, ry);

            if (z <= radius * 0.1) {
                const [sx, sy] = project(x, y, z, cx, cy, fov);
                const isSelected = selectedCountry?.id === country.id;

                const pulse = isSelected ? Math.sin(time * 4) * 0.5 + 0.5 : Math.sin(time * 2 + country.lat) * 0.5 + 0.5;
                const baseColor = isSelected ? "rgba(250, 204, 21, 1)" : markerColor;

                ctx.beginPath();
                ctx.arc(sx, sy, isSelected ? 6 + pulse * 8 : 3 + pulse * 3, 0, Math.PI * 2);
                ctx.strokeStyle = baseColor.replace("1)", `${isSelected ? 0.4 : 0.1} + ${pulse * 0.2})`);
                ctx.lineWidth = isSelected ? 2 : 1;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(sx, sy, isSelected ? 4 : 2, 0, Math.PI * 2);
                ctx.fillStyle = baseColor;
                ctx.fill();

                if (z <= -radius * 0.1) {
                    ctx.font = isSelected ? "bold 14px Pretendard, sans-serif" : "11px Pretendard, sans-serif";
                    ctx.fillStyle = isSelected ? "rgba(250, 204, 21, 1)" : "rgba(255,255,255,0.7)";
                    const labelText = isSelected ? `${country.name}: ${country.data[activeTopicId] || '?'}` : (country.data[activeTopicId] || '?');
                    ctx.fillText(labelText, sx + 12, sy + 4);
                }
            }
        });

        animRef.current = requestAnimationFrame(draw);
    }, [dotColor, arcColor, markerColor, selectedCountry, activeTopicId, countriesData]);

    useEffect(() => {
        animRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animRef.current);
    }, [draw]);

    const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, startRotY: rotYRef.current, startRotX: rotXRef.current };
        e.currentTarget.setPointerCapture(e.pointerId);
        isTargeting.current = false;
    };
    const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!dragRef.current.active) return;
        rotYRef.current = dragRef.current.startRotY + (e.clientX - dragRef.current.startX) * 0.005;
        rotXRef.current = Math.max(-1.5, Math.min(1.5, dragRef.current.startRotX + (e.clientY - dragRef.current.startY) * 0.005));
    };

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full cursor-grab active:cursor-grabbing opacity-90"
            style={{ width: '100%', height: size }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={() => dragRef.current.active = false}
        />
    );
}
