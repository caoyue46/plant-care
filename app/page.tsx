"use client";

import { useState, useEffect, useCallback } from "react";

// 植物类型定义
interface Plant {
  id: string;
  name: string;
  type: string;
  waterCycle: number;
  fertilizerCycle: number;
  lastWatered: string;
  lastFertilized: string;
  status: string;
  createdAt: string;
}

// 肥料类型定义
interface Fertilizer {
  id: string;
  name: string;
  type: string;
  createdAt: string;
}

// 养护记录类型定义
interface CareLog {
  id: string;
  plantId: string;
  plantName: string;
  action: string;
  createdAt: string;
}

export default function Home() {
  // 状态管理
  const [plants, setPlants] = useState<Plant[]>([]);
  const [fertilizers, setFertilizers] = useState<Fertilizer[]>([]);
  const [careLogs, setCareLogs] = useState<CareLog[]>([]);
  const [showAddPlant, setShowAddPlant] = useState(false);
  const [showAddFertilizer, setShowAddFertilizer] = useState(false);
  const [currentPage, setCurrentPage] = useState<
    "home" | "fertilizer" | "history" | "settings"
  >("home");
  const [loading, setLoading] = useState(true);

  // 新植物表单
  const [newPlant, setNewPlant] = useState({
    name: "",
    type: "中间型",
    waterCycle: 7,
    fertilizerCycle: 14,
  });

  // 新肥料表单
  const [newFertilizer, setNewFertilizer] = useState({
    name: "",
    type: "通用",
  });

  // 成功反馈状态
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 显示成功反馈
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  // 从 API 加载植物数据
  const loadPlants = useCallback(async () => {
    try {
      const res = await fetch("/api/plants");
      if (res.ok) {
        const data = await res.json();
        setPlants(data);
      }
    } catch (error) {
      console.error("加载植物失败:", error);
    }
  }, []);

  // 从 API 加载肥料数据
  const loadFertilizers = useCallback(async () => {
    try {
      const res = await fetch("/api/fertilizers");
      if (res.ok) {
        const data = await res.json();
        setFertilizers(data);
      }
    } catch (error) {
      console.error("加载肥料失败:", error);
    }
  }, []);

  // 从 API 加载养护记录
  const loadCareLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/logs");
      if (res.ok) {
        const data = await res.json();
        setCareLogs(data);
      }
    } catch (error) {
      console.error("加载养护记录失败:", error);
    }
  }, []);

  // 添加养护记录
  const addCareLog = async (
    plantId: string,
    plantName: string,
    action: string,
  ) => {
    try {
      const log = {
        id: Date.now().toString(),
        plantId,
        plantName,
        action,
        createdAt: new Date().toISOString(),
      };
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(log),
      });
      setCareLogs([log, ...careLogs]);
    } catch (error) {
      console.error("记录养护失败:", error);
    }
  };

  // 初始化加载数据
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadPlants(), loadFertilizers(), loadCareLogs()]);
      setLoading(false);
    };
    init();
  }, [loadPlants, loadFertilizers, loadCareLogs]);

  // 计算是否需要浇水
  const needsWatering = (plant: Plant) => {
    const lastWatered = new Date(plant.lastWatered);
    const today = new Date();
    const daysSince = Math.floor(
      (today.getTime() - lastWatered.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysSince >= plant.waterCycle;
  };

  // 计算是否需要施肥
  const needsFertilizing = (plant: Plant) => {
    const lastFertilized = new Date(plant.lastFertilized);
    const today = new Date();
    const daysSince = Math.floor(
      (today.getTime() - lastFertilized.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysSince >= plant.fertilizerCycle;
  };

  // 计算距离下次浇水的天数
  const daysUntilWatering = (plant: Plant) => {
    const lastWatered = new Date(plant.lastWatered);
    const today = new Date();
    const daysSince = Math.floor(
      (today.getTime() - lastWatered.getTime()) / (1000 * 60 * 60 * 24),
    );
    return plant.waterCycle - daysSince;
  };

  // 计算已经多少天没浇水
  const daysSinceWatering = (plant: Plant) => {
    const lastWatered = new Date(plant.lastWatered);
    const today = new Date();
    return Math.floor(
      (today.getTime() - lastWatered.getTime()) / (1000 * 60 * 60 * 24),
    );
  };

  // 计算已经多少天没施肥
  const daysSinceFertilizing = (plant: Plant) => {
    const lastFertilized = new Date(plant.lastFertilized);
    const today = new Date();
    return Math.floor(
      (today.getTime() - lastFertilized.getTime()) / (1000 * 60 * 60 * 24),
    );
  };

  // 获取植物情绪状态
  const getPlantMood = (plant: Plant) => {
    const daysLeft = daysUntilWatering(plant);
    const daysSince = daysSinceWatering(plant);

    if (daysSince === 0) {
      return { emoji: "😊", text: "刚喝饱，状态很好", color: "text-green-600" };
    } else if (daysLeft > 2) {
      return {
        emoji: "😌",
        text: "状态不错，不用担心",
        color: "text-green-600",
      };
    } else if (daysLeft > 0) {
      return {
        emoji: "😐",
        text: `还行，${daysLeft}天后要浇水`,
        color: "text-yellow-600",
      };
    } else if (daysLeft === 0) {
      return {
        emoji: "😰",
        text: "有点渴了，今天要浇水",
        color: "text-orange-600",
      };
    } else {
      return {
        emoji: "😫",
        text: `渴了${-daysLeft}天了，快浇水！`,
        color: "text-red-600",
      };
    }
  };

  // 添加植物
  const addPlant = async () => {
    if (!newPlant.name) return;

    const today = new Date().toISOString().split("T")[0];
    const plant: Plant = {
      id: Date.now().toString(),
      name: newPlant.name,
      type: newPlant.type,
      waterCycle: newPlant.waterCycle,
      fertilizerCycle: newPlant.fertilizerCycle,
      lastWatered: today,
      lastFertilized: today,
      status: "生长期",
      createdAt: today,
    };

    try {
      const res = await fetch("/api/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plant),
      });

      if (res.ok) {
        setPlants([...plants, plant]);
        setNewPlant({
          name: "",
          type: "中间型",
          waterCycle: 7,
          fertilizerCycle: 14,
        });
        setShowAddPlant(false);
        showSuccess(`🌱 ${plant.name} 加入了植物大家庭！`);
      }
    } catch (error) {
      console.error("添加植物失败:", error);
    }
  };

  // 添加肥料
  const addFertilizer = async () => {
    if (!newFertilizer.name) return;

    const today = new Date().toISOString().split("T")[0];
    const fertilizer: Fertilizer = {
      id: Date.now().toString(),
      name: newFertilizer.name,
      type: newFertilizer.type,
      createdAt: today,
    };

    try {
      const res = await fetch("/api/fertilizers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fertilizer),
      });

      if (res.ok) {
        setFertilizers([...fertilizers, fertilizer]);
        setNewFertilizer({ name: "", type: "通用" });
        setShowAddFertilizer(false);
        showSuccess(`🧴 ${fertilizer.name} 已添加到肥料库！`);
      }
    } catch (error) {
      console.error("添加肥料失败:", error);
    }
  };

  // 一键浇水
  const waterPlant = async (plantId: string) => {
    const plant = plants.find((p) => p.id === plantId);
    const today = new Date().toISOString().split("T")[0];

    try {
      const res = await fetch("/api/plants", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: plantId, lastWatered: today }),
      });

      if (res.ok) {
        setPlants(
          plants.map((p) =>
            p.id === plantId ? { ...p, lastWatered: today } : p,
          ),
        );
        if (plant) {
          showSuccess(`💧 ${plant.name} 喝饱了，状态很好！`);
          // 记录养护历史
          addCareLog(plantId, plant.name, "浇水");
        }
      }
    } catch (error) {
      console.error("浇水失败:", error);
    }
  };

  // 一键施肥
  const fertilizePlant = async (plantId: string) => {
    const plant = plants.find((p) => p.id === plantId);
    const today = new Date().toISOString().split("T")[0];

    try {
      const res = await fetch("/api/plants", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: plantId, lastFertilized: today }),
      });

      if (res.ok) {
        setPlants(
          plants.map((p) =>
            p.id === plantId ? { ...p, lastFertilized: today } : p,
          ),
        );
        if (plant) {
          showSuccess(`🌿 ${plant.name} 吃饱了，正在努力生长！`);
          // 记录养护历史
          addCareLog(plantId, plant.name, "施肥");
        }
      }
    } catch (error) {
      console.error("施肥失败:", error);
    }
  };

  // 删除植物
  const deletePlant = async (plantId: string) => {
    if (confirm("确定要删除这个植物吗？")) {
      try {
        const res = await fetch(`/api/plants?id=${plantId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          setPlants(plants.filter((p) => p.id !== plantId));
          showSuccess("植物已删除");
        }
      } catch (error) {
        console.error("删除植物失败:", error);
      }
    }
  };

  // 导出数据
  const exportData = () => {
    const data = {
      exportDate: new Date().toISOString().split("T")[0],
      version: "2.0",
      data: {
        plants,
        fertilizers,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plant-care-backup-${data.exportDate}.json`;
    a.click();
    showSuccess("📦 数据已导出，请妥善保管备份文件！");
  };

  // 导入数据
  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      if (!backup.data || !backup.data.plants) {
        alert("备份文件格式不正确");
        return;
      }

      if (
        !confirm(
          `确定要导入备份吗？\n\n备份日期：${backup.exportDate}\n植物数量：${backup.data.plants.length}\n肥料数量：${backup.data.fertilizers?.length || 0}\n\n注意：这将覆盖当前所有数据！`,
        )
      ) {
        return;
      }

      // 导入植物
      for (const plant of backup.data.plants) {
        await fetch("/api/plants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(plant),
        });
      }

      // 导入肥料
      if (backup.data.fertilizers) {
        for (const fertilizer of backup.data.fertilizers) {
          await fetch("/api/fertilizers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(fertilizer),
          });
        }
      }

      // 重新加载数据
      await loadPlants();
      await loadFertilizers();
      showSuccess("📥 数据导入成功！欢迎回来～");

      // 清空 input
      event.target.value = "";
    } catch (error) {
      console.error("导入失败:", error);
      alert("导入失败，请检查备份文件格式");
    }
  };

  // 需要浇水的植物
  const plantsNeedingWater = plants.filter(needsWatering);
  // 需要施肥的植物
  const plantsNeedingFertilizer = plants.filter(needsFertilizing);

  // 加载中状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🌱</p>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 成功反馈提示 */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          {successMessage}
        </div>
      )}

      {/* 顶部导航 */}
      <header className="bg-green-600 text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">🌱 植物养护助手</h1>
          <nav className="flex gap-2 text-sm">
            <button
              onClick={() => setCurrentPage("home")}
              className={`px-2 py-1 rounded ${currentPage === "home" ? "bg-green-700" : "hover:bg-green-500"}`}
            >
              首页
            </button>
            <button
              onClick={() => setCurrentPage("history")}
              className={`px-2 py-1 rounded ${currentPage === "history" ? "bg-green-700" : "hover:bg-green-500"}`}
            >
              历史
            </button>
            <button
              onClick={() => setCurrentPage("fertilizer")}
              className={`px-2 py-1 rounded ${currentPage === "fertilizer" ? "bg-green-700" : "hover:bg-green-500"}`}
            >
              肥料
            </button>
            <button
              onClick={() => setCurrentPage("settings")}
              className={`px-2 py-1 rounded ${currentPage === "settings" ? "bg-green-700" : "hover:bg-green-500"}`}
            >
              设置
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {/* 首页 */}
        {currentPage === "home" && (
          <>
            {/* 今日待办 */}
            {(plantsNeedingWater.length > 0 ||
              plantsNeedingFertilizer.length > 0) && (
              <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 mb-6">
                <h2 className="font-bold text-orange-800 mb-3">
                  🌅 今天有{" "}
                  {plantsNeedingWater.length + plantsNeedingFertilizer.length}{" "}
                  件事等着你
                </h2>
                <div className="space-y-2">
                  {plantsNeedingWater.map((plant) => (
                    <div
                      key={plant.id}
                      className="flex items-center justify-between bg-white rounded px-3 py-2"
                    >
                      <span className="text-orange-700">
                        💧 {plant.name} 已经 {daysSinceWatering(plant)}{" "}
                        天没喝水了
                      </span>
                      <button
                        onClick={() => waterPlant(plant.id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        浇水
                      </button>
                    </div>
                  ))}
                  {plantsNeedingFertilizer.map((plant) => (
                    <div
                      key={plant.id}
                      className="flex items-center justify-between bg-white rounded px-3 py-2"
                    >
                      <span className="text-orange-700">
                        🌿 {plant.name} 已经 {daysSinceFertilizing(plant)}{" "}
                        天没吃东西了
                      </span>
                      <button
                        onClick={() => fertilizePlant(plant.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                      >
                        施肥
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 全部完成的庆祝 */}
            {plants.length > 0 &&
              plantsNeedingWater.length === 0 &&
              plantsNeedingFertilizer.length === 0 && (
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6 text-center">
                  <p className="text-green-700 font-bold">
                    🎉 太棒了！今天的养护任务全部完成！
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    植物们都很开心，继续保持哦～
                  </p>
                </div>
              )}

            {/* 植物列表标题 */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">我的植物</h2>
              <button
                onClick={() => setShowAddPlant(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                + 添加
              </button>
            </div>

            {/* 植物列表 */}
            {plants.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-5xl mb-4">🌱</p>
                <p className="text-gray-700 font-bold mb-2">你的阳台还空着呢</p>
                <p className="text-gray-500 mb-4">
                  添加第一盆植物，开始你的养护之旅吧！
                </p>
                <button
                  onClick={() => setShowAddPlant(true)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  + 添加我的第一盆植物
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {plants.map((plant) => (
                  <div
                    key={plant.id}
                    className="bg-white rounded-lg shadow p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold">{plant.name}</h3>
                        <p className="text-sm text-gray-500">{plant.type}</p>
                      </div>
                      <button
                        onClick={() => deletePlant(plant.id)}
                        className="text-red-400 hover:text-red-600 text-sm"
                      >
                        删除
                      </button>
                    </div>

                    <div
                      className={`text-sm mb-3 ${getPlantMood(plant).color}`}
                    >
                      <span className="text-lg mr-1">
                        {getPlantMood(plant).emoji}
                      </span>
                      <span>{getPlantMood(plant).text}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => waterPlant(plant.id)}
                        className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 text-sm"
                      >
                        💧 浇水
                      </button>
                      <button
                        onClick={() => fertilizePlant(plant.id)}
                        className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 text-sm"
                      >
                        🌿 施肥
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 肥料页 */}
        {currentPage === "fertilizer" && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">我的肥料</h2>
              <button
                onClick={() => setShowAddFertilizer(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                + 添加
              </button>
            </div>

            {fertilizers.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <p className="text-4xl mb-4">🧴</p>
                <p>还没有肥料，点击上方按钮添加吧！</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow">
                {fertilizers.map((fertilizer, index) => (
                  <div
                    key={fertilizer.id}
                    className={`p-4 flex justify-between items-center ${index !== fertilizers.length - 1 ? "border-b" : ""}`}
                  >
                    <div>
                      <h3 className="font-bold">{fertilizer.name}</h3>
                      <p className="text-sm text-gray-500">{fertilizer.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 养护历史页 */}
        {currentPage === "history" && (
          <>
            <h2 className="text-lg font-bold mb-4">📖 养护历史</h2>

            {careLogs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-4xl mb-4">📝</p>
                <p className="text-gray-700 font-bold mb-2">还没有养护记录</p>
                <p className="text-gray-500">
                  给植物浇水或施肥后，这里会显示你的养护足迹
                </p>
              </div>
            ) : (
              <>
                {/* 统计信息 */}
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4 text-center">
                  <p className="text-green-700 font-bold">
                    🏆 你已经照顾植物 {careLogs.length} 次了，继续加油！
                  </p>
                </div>

                {/* 历史记录列表 */}
                <div className="bg-white rounded-lg shadow">
                  {careLogs.map((log, index) => (
                    <div
                      key={log.id}
                      className={`p-4 flex items-center gap-3 ${index !== careLogs.length - 1 ? "border-b" : ""}`}
                    >
                      <span className="text-2xl">
                        {log.action === "浇水" ? "💧" : "🌿"}
                      </span>
                      <div className="flex-1">
                        <p className="font-bold">{log.plantName}</p>
                        <p className="text-sm text-gray-500">
                          {log.action} ·{" "}
                          {new Date(log.createdAt).toLocaleString("zh-CN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* 设置页 */}
        {currentPage === "settings" && (
          <>
            <h2 className="text-lg font-bold mb-4">设置</h2>

            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h3 className="font-bold mb-3">数据管理</h3>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={exportData}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  📦 导出数据
                </button>
                <label className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 cursor-pointer">
                  📥 导入数据
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                💡 定期导出备份，换设备时可以导入恢复
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-2">关于</h3>
              <p className="text-sm text-gray-600">版本：2.0（云端存储版）</p>
              <p className="text-sm text-gray-600">作者：caoyue</p>
              <p className="text-sm text-gray-600">数据库：Turso (SQLite)</p>
            </div>
          </>
        )}
      </main>

      {/* 添加植物弹窗 */}
      {showAddPlant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">添加植物</h2>
              <button
                onClick={() => setShowAddPlant(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  植物名称
                </label>
                <input
                  type="text"
                  value={newPlant.name}
                  onChange={(e) =>
                    setNewPlant({ ...newPlant, name: e.target.value })
                  }
                  placeholder="如：朱顶红1号"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  植物类型
                </label>
                <select
                  value={newPlant.type}
                  onChange={(e) =>
                    setNewPlant({ ...newPlant, type: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="冬型种">冬型种</option>
                  <option value="夏型种">夏型种</option>
                  <option value="中间型">中间型</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  浇水周期（天）
                </label>
                <input
                  type="number"
                  value={newPlant.waterCycle}
                  onChange={(e) =>
                    setNewPlant({
                      ...newPlant,
                      waterCycle: parseInt(e.target.value) || 7,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  施肥周期（天）
                </label>
                <input
                  type="number"
                  value={newPlant.fertilizerCycle}
                  onChange={(e) =>
                    setNewPlant({
                      ...newPlant,
                      fertilizerCycle: parseInt(e.target.value) || 14,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddPlant(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-100"
                >
                  取消
                </button>
                <button
                  onClick={addPlant}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 添加肥料弹窗 */}
      {showAddFertilizer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">添加肥料</h2>
              <button
                onClick={() => setShowAddFertilizer(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  肥料名称
                </label>
                <input
                  type="text"
                  value={newFertilizer.name}
                  onChange={(e) =>
                    setNewFertilizer({ ...newFertilizer, name: e.target.value })
                  }
                  placeholder="如：花多多1号"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  肥料类型
                </label>
                <select
                  value={newFertilizer.type}
                  onChange={(e) =>
                    setNewFertilizer({ ...newFertilizer, type: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="促生长">促生长（高氮）</option>
                  <option value="促花">促花（高磷钾）</option>
                  <option value="通用">通用型</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddFertilizer(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-100"
                >
                  取消
                </button>
                <button
                  onClick={addFertilizer}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
